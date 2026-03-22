const express = require("express");
const router = express.Router();
const { getSheets, SPREADSHEET_ID } = require("../services/sheets");

const MEMBER_SHEET = "Members";

// ── Helper: rows to members ───────────────────────────────────────────────────
const rowsToMembers = (rows) => {
  if (!rows || rows.length <= 1) return [];
  const [headers, ...data] = rows;
  return data.map((row) => {
    const member = {};
    headers.forEach((header, i) => {
      member[header] = row[i] ?? "";
    });
    member.id     = parseInt(member.id) || 0;
    member.stamps = parseInt(member.stamps) || 0;
    return member;
  });
};

// ── GET /members — fetch all members (for dropdown in POS) ────────────────────
router.get("/", async (req, res) => {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MEMBER_SHEET}!A1:H1000`,
    });
    const members = rowsToMembers(response.data.values || []);
    console.log("Members from sheet:", JSON.stringify(members));
    // Return only non-admin members, without passwords
    const safeMembers = members
      .filter((m) => m.role === "member")
      .map(({ password, ...m }) => m);
    res.json(safeMembers);
  } catch (error) {
    console.error("GET /members error:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

// ── POST /members/signup ──────────────────────────────────────────────────────
router.post("/signup", async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (!full_name || !email || !password || !phone) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MEMBER_SHEET}!A1:H1000`,
    });

    const members = rowsToMembers(response.data.values || []);
    const existing = members.find((m) => m.email.toLowerCase() === email.toLowerCase());

    if (existing) {
      return res.status(409).json({ error: "Username already registered" });
    }

    const nextId      = members.length > 0 ? Math.max(...members.map((m) => m.id)) + 1 : 1;
    const joined_date = new Date().toLocaleDateString("en-PH");
    const role        = "member";
    const stamps      = 0;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MEMBER_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[nextId, full_name, email, password, phone, joined_date, role, stamps]],
      },
    });

    const member = { id: nextId, full_name, email, phone, joined_date, role, stamps };
    res.json({ message: "Signup successful!", member });
  } catch (error) {
    console.error("POST /members/signup error:", error);
    res.status(500).json({ error: "Signup failed" });
  }
});

// ── POST /members/login ───────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MEMBER_SHEET}!A1:H1000`,
    });

    const members = rowsToMembers(response.data.values || []);
    const member  = members.find(
      (m) => m.email.toLowerCase() === email.toLowerCase() && m.password === password
    );

    if (!member) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const { password: _, ...memberData } = member;
    res.json({ role: member.role, member: memberData });
  } catch (error) {
    console.error("POST /members/login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// ── PATCH /members/:id/stamps — update stamps ─────────────────────────────────
router.patch("/:id/stamps", async (req, res) => {
  try {
    const { id }     = req.params;
    const { stamps } = req.body;
    const sheets     = await getSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MEMBER_SHEET}!A1:H1000`,
    });

    const rows     = response.data.values;
    const rowIndex = rows.findIndex((row, i) => i > 0 && row[0] == id);

    if (rowIndex === -1) {
      return res.status(404).json({ error: "Member not found" });
    }

    const sheetRow = rowIndex + 1;

    // Column H is stamps (index 8)
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${MEMBER_SHEET}!H${sheetRow}`,
      valueInputOption: "RAW",
      requestBody: { values: [[stamps]] },
    });

    res.json({ id, stamps });
  } catch (error) {
    console.error("PATCH /members/:id/stamps error:", error);
    res.status(500).json({ error: "Failed to update stamps" });
  }
});

module.exports = router;