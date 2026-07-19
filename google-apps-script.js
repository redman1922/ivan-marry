const SPREADSHEET_ID = '14gsoZMfzrV--zbw_eXEfaogsZOAfEEZsPSXoJggqM7I';

const SHEETS = {
  rsvp: {
    name: 'RSVP',
    headers: ['sentAt', 'attendance', 'name', 'guests', 'overnight', 'drinks', 'telegram'],
  },
  song: {
    name: 'Songs',
    headers: ['sentAt', 'song'],
  },
};

function doPost(event) {
  const request = JSON.parse(event.postData.contents || '{}');
  const type = request.type === 'song' ? 'song' : 'rsvp';
  const payload = request.payload || {};
  const config = SHEETS[type];
  const sheet = getSheet(config);

  if (type === 'song') {
    sheet.appendRow([
      request.sentAt || new Date().toISOString(),
      payload.song || '',
    ]);
  } else {
    sheet.appendRow([
      request.sentAt || new Date().toISOString(),
      payload.attendance || '',
      payload.name || '',
      payload.guests || '',
      payload.overnight || '',
      Array.isArray(payload.drinks) ? payload.drinks.join(', ') : '',
      payload.telegram || '',
    ]);
  }

  return ContentService
    .createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheets = spreadsheet.getSheets().map((sheet) => ({
    name: sheet.getName(),
    rows: sheet.getLastRow(),
  }));

  return ContentService
    .createTextOutput(JSON.stringify({
      ok: true,
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl(),
      sheets,
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(config) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = spreadsheet.getSheetByName(config.name) || spreadsheet.insertSheet(config.name);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(config.headers);
  }

  return sheet;
}
