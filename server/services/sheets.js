const { google } = require("googleapis");
require("dotenv").config();

const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const getSheets = async () => {
  const client = await auth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });
  return sheets;
};

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const SHEET_NAME = "Products";

module.exports = { getSheets, SPREADSHEET_ID, SHEET_NAME };