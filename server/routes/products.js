  const express = require("express");
  const router = express.Router();
  const { getSheets, SPREADSHEET_ID, SHEET_NAME } = require("../services/sheets");

  const rowsToProducts = (rows) => {
    if (!rows || rows.length === 0) return [];
    const [headers, ...data] = rows;
    return data.map((row) => {
      const product = {};
      headers.forEach((header, i) => {
        product[header] = row[i] ?? "";
      });
      product.price = parseInt(product.price) || 0;
      product.stock = parseInt(product.stock) || 0;
      product.id    = parseInt(product.id) || 0;
      product.size_price = parseInt(product.size_price) || 0;
      return product;
    });
  };

  router.get("/", async (req, res) => {
    try {
      const sheets = await getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:G1000`,
      });
      const products = rowsToProducts(response.data.values);
      res.json(products);
    } catch (error) {
      console.error("GET /products error:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  router.post("/", async (req, res) => {
    try {
      const { name, category, price, icon, stock, size_price } = req.body;
      const sheets = await getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:G1000`,
      });
      const products = rowsToProducts(response.data.values);
      const nextId = products.length > 0 ? Math.max(...products.map((p) => p.id)) + 1 : 1;
      await sheets.spreadsheets.values.append({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1`,
        valueInputOption: "RAW",
        requestBody: {
          values: [[nextId, name, category, price, icon, stock, size_price || ""]],
        },
      });
      res.json({ id: nextId, name, category, price, icon, stock });
    } catch (error) {
      console.error("POST /products error:", error);
      res.status(500).json({ error: "Failed to add product" });
    }
  });

  router.patch("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { stock, price, size_price } = req.body;
      const sheets = await getSheets();
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:G1000`,
      });
      const rows = response.data.values;
      const rowIndex = rows.findIndex((row, i) => i > 0 && row[0] == id);
      if (rowIndex === -1) {
        return res.status(404).json({ error: "Product not found" });
      }
      const sheetRow = rowIndex + 1;
      if (stock !== undefined) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!F${sheetRow}`,
        valueInputOption: "RAW",
        requestBody: { values: [[stock]] },
      });
      }
      if (price !== undefined) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!D${sheetRow}`,
          valueInputOption: "RAW",
          requestBody: { values: [[price]] },
        });
      }
      if (size_price !== undefined) {
        await sheets.spreadsheets.values.update({
          spreadsheetId: SPREADSHEET_ID,
          range: `${SHEET_NAME}!G${sheetRow}`,
          valueInputOption: "RAW",
          requestBody: { values: [[size_price]] },
        });
      }
      res.json({ id, stock, price, size_price });
    } catch (error) {
      console.error("PATCH /products/:id error:", error);
      res.status(500).json({ error: "Failed to update stock" });
    }
  });

  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const sheets = await getSheets();
      const meta = await sheets.spreadsheets.get({
        spreadsheetId: SPREADSHEET_ID,
      });
      const sheet = meta.data.sheets.find((s) => s.properties.title === SHEET_NAME);
      const sheetId = sheet.properties.sheetId;
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${SHEET_NAME}!A1:F1000`,
      });
      const rows = response.data.values;
      const rowIndex = rows.findIndex((row, i) => i > 0 && row[0] == id);
      if (rowIndex === -1) {
        return res.status(404).json({ error: "Product not found" });
      }
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
      res.json({ message: `Product ${id} deleted` });
    } catch (error) {
      console.error("DELETE /products/:id error:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  module.exports = router;