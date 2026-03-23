const express = require("express");
const router = express.Router();
const { getSheets, SPREADSHEET_ID } = require("../services/sheets");

const CARD_SHEET = "LoyaltyCards";

// ── GET /loyalty/:member_id ───────────────────────────────────────────────────
router.get("/:member_id", async (req, res) => {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CARD_SHEET}!A1:G1000`,
    });
    const rows = response.data.values || [];
    if (rows.length <= 1) return res.json([]);
    const [headers, ...data] = rows;
    const cards = data
      .map((row, i) => ({
        rowIndex: i + 2,
        id:             row[0] || "",
        member_id:      row[1] || "",
        stamps:         parseInt(row[2]) || 0,
        completed:      row[3] === "true",
        completed_date: row[4] || "",
        used:           row[5] === "true",
        used_date:      row[6] || "",
      }))
      .filter((c) => String(c.member_id) === String(req.params.member_id));
    res.json(cards);
  } catch (error) {
    console.error("GET /loyalty error:", error);
    res.status(500).json({ error: "Failed to fetch loyalty cards" });
  }
});

// ── PATCH /loyalty/:member_id/addstamps ──────────────────────────────────────
router.patch("/:member_id/addstamps", async (req, res) => {
  try {
    const { member_id }    = req.params;
    const { stamps_to_add, discount_used } = req.body;
    const sheets = await getSheets();
    const now    = new Date().toLocaleDateString("en-PH");

    // Fetch all cards
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CARD_SHEET}!A1:G1000`,
    });
    const rows = response.data.values || [];
    const allCards = (rows.slice(1) || []).map((row, i) => ({
      rowIndex: i + 2,
      id:             row[0] || "",
      member_id:      row[1] || "",
      stamps:         parseInt(row[2]) || 0,
      completed:      row[3] === "true",
      completed_date: row[4] || "",
      used:           row[5] === "true",
      used_date:      row[6] || "",
    }));

    const memberCards = allCards.filter((c) => String(c.member_id) === String(member_id));

    // Find active card (not yet completed)
    let activeCard = memberCards.find((c) => !c.completed);

    // If discount used, mark oldest completed+unused card as used
    if (discount_used) {
      const cardToUse = memberCards.find((c) => c.completed && !c.used);
      if (cardToUse) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${CARD_SHEET}!F${cardToUse.rowIndex}`,
          valueInputOption: "RAW",
          requestBody: { values: [["true"]] },
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${CARD_SHEET}!G${cardToUse.rowIndex}`,
          valueInputOption: "RAW",
          requestBody: { values: [[now]] },
        });
      }
    }

    // If no active card, create one
    if (!activeCard) {
      const nextId = rows.length;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CARD_SHEET}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [[nextId, member_id, 0, "false", "", "false", ""]] },
      });
      const refetch = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CARD_SHEET}!A1:G1000`,
      });
      const newRows = refetch.data.values || [];
      activeCard = {
        rowIndex: newRows.length,
        stamps: 0,
      };
    }

    // Distribute stamps across cards using a loop
    // If discount used, the 9th purchase (1 stamp) doesn't count
    let remainingStamps     = discount_used ? Math.max(0, stamps_to_add - 1) : stamps_to_add;
    let currentCardStamps   = activeCard.stamps;
    let currentCardRowIndex = activeCard.rowIndex;

    while (remainingStamps > 0) {
      const spaceLeft = 8 - currentCardStamps;

      if (remainingStamps >= spaceLeft) {
        // Complete this card
        remainingStamps  -= spaceLeft;

        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${CARD_SHEET}!C${currentCardRowIndex}`,
          valueInputOption: "RAW",
          requestBody: { values: [[8]] },
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${CARD_SHEET}!D${currentCardRowIndex}`,
          valueInputOption: "RAW",
          requestBody: { values: [["true"]] },
        });
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${CARD_SHEET}!E${currentCardRowIndex}`,
          valueInputOption: "RAW",
          requestBody: { values: [[now]] },
        });

        if (remainingStamps > 0) {
          // Create new card
          const refetch = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CARD_SHEET}!A1:G1000`,
          });
          const newRows = refetch.data.values || [];
          const nextId  = newRows.length;

          await sheets.spreadsheets.values.append({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CARD_SHEET}!A1`,
            valueInputOption: "RAW",
            requestBody: { values: [[nextId, member_id, 0, "false", "", "false", ""]] },
          });

          const refetch2      = await sheets.spreadsheets.values.get({
            spreadsheetId: SPREADSHEET_ID,
            range: `${CARD_SHEET}!A1:G1000`,
          });
          currentCardRowIndex = refetch2.data.values.length;
          currentCardStamps   = 0;
        }
      } else {
        // Add remaining stamps to current card
        currentCardStamps += remainingStamps;
        remainingStamps    = 0;

        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${CARD_SHEET}!C${currentCardRowIndex}`,
          valueInputOption: "RAW",
          requestBody: { values: [[currentCardStamps]] },
        });
      }
    }

    res.json({ success: true });
  } catch (error) {
    console.error("PATCH /loyalty/addstamps error:", error);
    res.status(500).json({ error: "Failed to update stamps" });
  }
});

// ── POST /loyalty — create a new card ────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    const { member_id } = req.body;
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CARD_SHEET}!A1:G1000`,
    });
    const rows   = response.data.values || [];
    const nextId = rows.length;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CARD_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: { values: [[nextId, member_id, 0, "false", "", "false", ""]] },
    });

    res.json({ id: nextId, member_id, stamps: 0, completed: false, used: false });
  } catch (error) {
    console.error("POST /loyalty error:", error);
    res.status(500).json({ error: "Failed to create loyalty card" });
  }
});

module.exports = router;