# ivan-marry

## Google Sheets

Формы отправляют данные в Google Apps Script Web App. Скрипт для вставки в Apps Script лежит в `google-apps-script.js`.

1. Создайте Google Таблицу.
2. Скопируйте ID таблицы из URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`
3. Откройте `Extensions -> Apps Script` и вставьте код из `google-apps-script.js`.
4. В Apps Script замените `PASTE_SPREADSHEET_ID` на ID таблицы.
5. Нажмите `Deploy -> New deployment -> Web app`.
6. В настройках деплоя выберите:
   - `Execute as`: Me
   - `Who has access`: Anyone
7. Скопируйте Web App URL.
8. Создайте локальный `.env` по примеру `.env.example`:
   ```env
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
   ```
9. Перезапустите dev-сервер или пересоберите сайт.

Ответы анкеты будут попадать в лист `RSVP`, предложения песен — в лист `Songs`.
