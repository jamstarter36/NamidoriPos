const express = require("express");
const router = express.Router();
const { getSheets, SPREADSHEET_ID } = require("../services/sheets");

const ORDER_SHEET  = "Orders";
const MEMBER_SHEET = "Members";

// ── POST /orders — save a new order ──────────────────────────────────────────
router.post("/", async (req, res) => {
  try {
    console.log("ORDER BODY:", JSON.stringify(req.body));
    const { items, subtotal, vat_rate, vat_amount, total, member_id, discount } = req.body;
    const discountUsed = discount > 0;
    const sheets = await getSheets();

    // Generate order ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ORDER_SHEET}!A1:H1000`,
    });
    const rows = response.data.values || [];
    const nextOrderId = rows.length;

    // Format date and time
    const now  = new Date();
    const date = now.toLocaleDateString("en-PH");
    const time = now.toLocaleTimeString("en-PH");

    // Format items as readable string
    const itemsString = items.map((i) => `${i.name} x${i.qty}`).join(", ");

    // Append new order row
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ORDER_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[nextOrderId, date, time, itemsString, subtotal, vat_rate, vat_amount, total]],
      },
    });

    // ── Update member stamps if member is attached ──
    if (member_id) {
      const memberRes = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${MEMBER_SHEET}!A1:Z1000`,
      });

      const memberRows   = memberRes.data.values || [];
      const memberHeader = memberRows[0];
      const idCol        = memberHeader.indexOf("id");
      const stampsCol    = memberHeader.indexOf("stamps");

      const memberRowIndex = memberRows.findIndex((row, i) => i > 0 && String(row[idCol]) === String(member_id));

      if (memberRowIndex !== -1) {
        const currentStamps = parseInt(memberRows[memberRowIndex][stampsCol]) || 0;
        const itemsOrdered  = items.filter(i => !i.isFree).reduce((s, i) => s + i.qty, 0);

        let newStamps;

        if (discountUsed) {
          /*
            DISCOUNT USED LOGIC:
            - The purchase that triggers the discount (9th) = no stamp
            - Any items BEYOND the 9th in the same order = stamps for next card
            - Formula: (currentStamps + itemsOrdered) - 8 (completed card) - 1 (free purchase)
            - Example: 8 stamps + 2 items = 10 - 8 - 1 = 1 stamp ✅
            - Example: 8 stamps + 1 item  = 9  - 8 - 1 = 0 stamps ✅
            - Example: 8 stamps + 3 items = 11 - 8 - 1 = 2 stamps ✅
          */
          newStamps = Math.max(0, (currentStamps + itemsOrdered) - 8 - 1);
        } else {
          /*
            NO DISCOUNT USED:
            - Stamps accumulate normally
            - Capped at 8 until discount is redeemed
          */
          newStamps = Math.min(currentStamps + itemsOrdered, 8);
        }

        console.log(`Stamps: ${currentStamps} + ${itemsOrdered} items → saved as ${newStamps} (discountUsed: ${discountUsed})`);

        const sheetRow   = memberRowIndex + 1;
        const stampsCell = `${MEMBER_SHEET}!${String.fromCharCode(65 + stampsCol)}${sheetRow}`;

        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: stampsCell,
          valueInputOption: "RAW",
          requestBody: { values: [[newStamps]] },
        });
      }
    }

    res.json({ order_id: nextOrderId, date, time, itemsString, subtotal, vat_rate, vat_amount, total });
  } catch (error) {
    console.error("POST /orders error:", error);
    res.status(500).json({ error: "Failed to save order" });
  }
});

// ── GET /orders — fetch all orders ───────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ORDER_SHEET}!A1:H1000`,
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return res.json([]);

    const [headers, ...data] = rows;
    const orders = data.map((row) => {
      const order = {};
      headers.forEach((header, i) => {
        order[header] = row[i] ?? "";
      });
      order.subtotal   = parseFloat(order.subtotal) || 0;
      order.vat_rate   = parseFloat(order.vat_rate) || 0;
      order.vat_amount = parseFloat(order.vat_amount) || 0;
      order.total      = parseFloat(order.total) || 0;
      return order;
    });

    res.json(orders);
  } catch (error) {
    console.error("GET /orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

module.exports = router;