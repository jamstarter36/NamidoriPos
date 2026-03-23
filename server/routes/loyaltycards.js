// Add remaining stamps to active card — loop to handle multiple card completions
let remainingStamps = discount_used ? Math.max(0, stamps_to_add - 1) : stamps_to_add;
let currentCardStamps = activeCard.stamps;
let currentCardRowIndex = activeCard.rowIndex;
let isFirstCard = true;

while (remainingStamps > 0) {
  const spaceLeft = 8 - currentCardStamps;

  if (remainingStamps >= spaceLeft) {
    // Complete this card
    remainingStamps -= spaceLeft;
    currentCardStamps = 8;

    // Update current card as completed
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
      // Create a new card
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

      // Re-fetch to get the new row index
      const refetch2  = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: `${CARD_SHEET}!A1:G1000`,
      });
      currentCardRowIndex = refetch2.data.values.length;
      currentCardStamps   = 0;
    }
  } else {
    // Just add remaining stamps to current card
    currentCardStamps += remainingStamps;
    remainingStamps = 0;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${CARD_SHEET}!C${currentCardRowIndex}`,
      valueInputOption: "RAW",
      requestBody: { values: [[currentCardStamps]] },
    });
  }
}