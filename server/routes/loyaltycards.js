const express = require("express");
const router = express.Router();
const { getSheets, SPREADSHEET_ID } = require("../services/sheets");

const CARD_SHEET = "LoyaltyCards";

// ── Helper: get all cards for a member ───────────────────────────────────────
const getMemberCards = async (sheets, member_id) => {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${CARD_SHEET}!A1:G1000`,
  });
  const rows = response.data.values || [];
  if (rows.length <= 1) return { rows, headers: rows[0] || [], cards: [] };
  const [headers, ...data] = rows;
  const cards = data
    .map((row, i) => ({
      rowIndex: i + 2, // 1-indexed, skip header
      id:             row[0] || "",
      member_id:      row[1] || "",
      stamps:         parseInt(row[2]) || 0,
      completed:      row[3] === "true",
      completed_date: row[4] || "",
      used:           row[5] === "true",
      used_date:      row[6] || "",
    }))
    .filter((c) => String(c.member_id) === String(member_id));
  return { rows, headers, cards };
};

// ── GET /loyalty/:member_id — get all cards for a member ─────────────────────
router.get("/:member_id", async (req, res) => {
  try {
    const sheets = await getSheets();
    const { cards } = await getMemberCards(sheets, req.params.member_id);
    res.json(cards);
  } catch (error) {
    console.error("GET /loyalty error:", error);
    res.status(500).json({ error: "Failed to fetch loyalty cards" });
  }
});

// ── POST /loyalty — create a new card for a member ───────────────────────────
router.post("/", async (req, res) => {
  try {
    const { member_id, stamps = 0 } = req.body;
    const sheets = await getSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CARD_SHEET}!A1:G1000`,
    });
    const rows = response.data.values || [];
    const nextId = rows.length; // header counts as 1

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CARD_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[nextId, member_id, stamps, "false", "", "false", ""]],
      },
    });

    res.json({ id: nextId, member_id, stamps, completed: false, used: false });
  } catch (error) {
    console.error("POST /loyalty error:", error);
    res.status(500).json({ error: "Failed to create loyalty card" });
  }
});

// ── PATCH /loyalty/:member_id/addstamps — add stamps to active card ──────────
router.patch("/:member_id/addstamps", async (req, res) => {
  try {
    const { member_id }  = req.params;
    const { stamps_to_add, discount_used } = req.body;
    const sheets = await getSheets();
    const now    = new Date().toLocaleDateString("en-PH");

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CARD_SHEET}!A1:G1000`,
    });

    const rows    = response.data.values || [];
    const headers = rows[0];
    const allRows = rows.slice(1).map((row, i) => ({
      rowIndex: i + 2,
      id:             row[0] || "",
      member_id:      row[1] || "",
      stamps:         parseInt(row[2]) || 0,
      completed:      row[3] === "true",
      completed_date: row[4] || "",
      used:           row[5] === "true",
      used_date:      row[6] || "",
    }));

    // Get member's cards
    const memberCards = allRows.filter((c) => String(c.member_id) === String(member_id));

    // Find active card (not completed or completed but not used)
    let activeCard = memberCards.find((c) => !c.completed);

    // If no active card exists, create one
    if (!activeCard) {
      const nextId = rows.length;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CARD_SHEET}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[nextId, member_id, 0, "false", "", "false", ""]],
        },
      });
      // Re-fetch
      const refetch = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CARD_SHEET}!A1:G1000`,
      });
      const newRows = refetch.data.values || [];
      const lastRow = newRows[newRows.length - 1];
      activeCard = {
        rowIndex: newRows.length,
        id: lastRow[0],
        member_id: lastRow[1],
        stamps: 0,
        completed: false,
        used: false,
      };
    }

    // Find completed but unused cards (for discount)
    const completedUnusedCard = memberCards.find((c) => c.completed && !c.used);

    let remainingStamps = stamps_to_add;
    const updates = [];

    // If discount is used, mark the completed card as used
    if (discount_used && completedUnusedCard) {
      updates.push({
        range: `${CARD_SHEET}!F${completedUnusedCard.rowIndex}`,
        values: [["true"]],
      });
      updates.push({
        range: `${CARD_SHEET}!G${completedUnusedCard.rowIndex}`,
        values: [[now]],
      });
      // The stamp that triggered the discount doesn't count
      remainingStamps = Math.max(0, stamps_to_add - 1);
    }

    // Add remaining stamps to active card
    let newStamps = activeCard.stamps + remainingStamps;
    let newCompleted = activeCard.completed;
    let newCompletedDate = activeCard.completed_date;

    if (newStamps >= 8) {
      // Complete the active card
      newStamps = 8;
      newCompleted = true;
      newCompletedDate = now;

      // Create a new active card with overflow stamps
      const overflowStamps = (activeCard.stamps + remainingStamps) - 8;
      if (overflowStamps > 0) {
        const nextId = rows.length + updates.length;
        await sheets.spreadsheets.values.append({
          spreadsheetId: SPREADSHEET_ID,
          range: `${CARD_SHEET}!A1`,
          valueInputOption: "RAW",
          requestBody: {
            values: [[nextId, member_id, overflowStamps, "false", "", "false", ""]],
          },
        });
      }
    }

    // Update active card stamps
    updates.push({
      range: `${CARD_SHEET}!C${activeCard.rowIndex}`,
      values: [[newStamps]],
    });
    updates.push({
      range: `${CARD_SHEET}!D${activeCard.rowIndex}`,
      values: [[String(newCompleted)]],
    });
    if (newCompleted) {
      updates.push({
        range: `${CARD_SHEET}!E${activeCard.rowIndex}`,
        values: [[newCompletedDate]],
      });
    }

    // Batch update
    for (const update of updates) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: update.range,
        valueInputOption: "RAW",
        requestBody: { values: update.values },
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error("PATCH /loyalty/addstamps error:", error);
    res.status(500).json({ error: "Failed to update stamps" });
  }
});

module.exports = router;