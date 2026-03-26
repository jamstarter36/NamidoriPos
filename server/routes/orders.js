const express = require("express");
const router = express.Router();
const { getSheets, SPREADSHEET_ID } = require("../services/sheets");

const ORDER_SHEET = "Orders";

router.post("/", async (req, res) => {
  try {
    console.log("ORDER BODY:", JSON.stringify(req.body));
    const { items, item_details, subtotal, vat_rate, vat_amount, total, member_id, member_name, discount } = req.body;
    const sheets = await getSheets();

    // Generate order ID
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ORDER_SHEET}!A1:K1000`,
    });
    const rows = response.data.values || [];
    const nextOrderId = String(rows.length).padStart(4, "0");

    const now  = new Date();
    const date = now.toLocaleDateString("en-PH", { timeZone: "Asia/Manila" });
    const time = now.toLocaleTimeString("en-PH", { timeZone: "Asia/Manila" });

    // items is now a string from the frontend
    const itemsString = typeof items === "string"
      ? items
      : items.map((i) => `${i.name} x${i.qty}`).join(", ");

    const detailsString = item_details || "";
    const discountValue = discount || 0;
    const memberName    = member_name || "Walk-in";

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ORDER_SHEET}!A1`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          nextOrderId, date, time,
          itemsString, detailsString,
          subtotal, vat_rate, vat_amount,
          discountValue, total, memberName
        ]],
      },
    });

    res.json({ order_id: nextOrderId, date, time, itemsString, subtotal, vat_rate, vat_amount, total, discount: discountValue });
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
      range: `${ORDER_SHEET}!A1:K1000`,
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
      order.discount      = parseFloat(order.discount) || 0;
      order.item_details  = order.item_details || "";
      order.member_name   = order.member_name || "Walk-in";
      return order;
    });
    res.json(orders);
  } catch (error) {
    console.error("GET /orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.delete("/:order_id", async (req, res) => {
  try {
    const { order_id } = req.params;
    const sheets = await getSheets();

    // Get sheet ID
    const meta = await sheets.spreadsheets.get({ spreadsheetId: SPREADSHEET_ID });
    const sheet = meta.data.sheets.find((s) => s.properties.title === ORDER_SHEET);
    const sheetId = sheet.properties.sheetId;

    // Find the row
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: `${ORDER_SHEET}!A1:K1000`,
    });
    const rows = response.data.values || [];
    const rowIndex = rows.findIndex((row, i) => i > 0 && row[0] === order_id);
    if (rowIndex === -1) return res.status(404).json({ error: "Order not found" });

    // Delete the row
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: {
        requests: [{
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        }],
      },
    });

    res.json({ message: `Order ${order_id} deleted` });
  } catch (error) {
    console.error("DELETE /orders/:order_id error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

module.exports = router;