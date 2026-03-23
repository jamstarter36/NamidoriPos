const express = require("express");
const router  = express.Router();
const { getSheets, SPREADSHEET_ID } = require("../services/sheets");

const TESTIMONY_SHEET = "Testimony";

// GET /api/testimony/:member_id
router.get("/:member_id", async (req, res) => {
  try {
    const sheets   = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TESTIMONY_SHEET}!A1:E1000`,
    });
    const rows = response.data.values || [];
    if (rows.length <= 1) return res.json(null);

    const [, ...data] = rows;
    const match = data
      .map((row) => ({
        id:        row[0] || "",
        member_id: row[1] || "",
        full_name: row[2] || "",
        testimony: row[3] || "",
        stars:     parseInt(row[4]) || 0,
      }))
      .find((t) => String(t.member_id) === String(req.params.member_id));

    res.json(match || null);
  } catch (error) {
    console.error("GET /testimony error:", error);
    res.status(500).json({ error: "Failed to fetch testimony" });
  }
});

// POST /api/testimony (insert or update)
router.post("/", async (req, res) => {
  try {
    const { member_id, full_name, testimony, stars } = req.body;
    const sheets   = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${TESTIMONY_SHEET}!A1:E1000`,
    });
    const rows = response.data.values || [];

    const existingRowIndex = rows.findIndex(
      (row, i) => i > 0 && String(row[1]) === String(member_id)
    );

    if (existingRowIndex !== -1) {
      const rowNumber = existingRowIndex + 1;
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TESTIMONY_SHEET}!A${rowNumber}:E${rowNumber}`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[rows[existingRowIndex][0], member_id, full_name, testimony, stars]],
        },
      });
    } else {
      const nextId = rows.length;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${TESTIMONY_SHEET}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[nextId, member_id, full_name, testimony, stars]],
        },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("POST /testimony error:", error);
    res.status(500).json({ error: "Failed to submit testimony" });
  }
});

module.exports = router;