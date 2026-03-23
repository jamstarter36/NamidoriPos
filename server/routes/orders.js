const express = require("express");
const router = express.Router();
const { getSheets, SPREADSHEET_ID } = require("../services/sheets");

const ORDER_SHEET = "Orders";

router.post("/", async (req, res) => {
  try {
    console.log("ORDER BODY:", JSON.stringify(req.body));
    const { items, subtotal, vat_rate, vat_amount, total, member_id, discount } = req.body;
    const sheets = await getSheets();

    // Generate order ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ORDER_SHEET}!A1:H1000`,
    });
    const rows = response.data.values || [];
    const nextOrderId = rows.length;

    const now  = new Date();
    const date = now.toLocaleDateString("en-PH");
    const time = now.toLocaleTimeString("en-PH");
    const itemsString = items.map((i) => `${i.name} x${i.qty}`).join(", ");

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ORDER_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[nextOrderId, date, time, itemsString, subtotal, vat_rate, vat_amount, total]],
      },
    });

    res.json({ order_id: nextOrderId, date, time, itemsString, subtotal, vat_rate, vat_amount, total });
  } catch (error) {
    console.error("POST /orders error:", error);
    res.status(500).json({ error: "Failed to save order" });
  }
});

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
      headers.forEach((header, i) => { order[header] = row[i] ?? ""; });
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