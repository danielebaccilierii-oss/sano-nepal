# Sano Nepal â€” website

Restaurant website for Sano Nepal, Sörnäinen, Helsinki.
Single-file static site (index.html) with inline CSS and JS, Google Fonts, FI/EN toggle, light/dark theme, daily lunch buffet selector, table booking by email and WhatsApp.

## Editing without code (Google Sheet)

Menu, lunch buffet and gallery photos can be managed from a Google Sheet:

1. Create the sheet using the CSV templates (tabs named exactly: `Menu`, `Lunch`, `Gallery`).
2. File > Share > Publish to web.
3. Copy the Sheet ID from its URL and paste it into `sheet-config.js`, then commit.
4. From then on, edit the sheet only -- the site updates itself.
If `sheet-config.js` has no ID, the site falls back to the built-in data.

Preview locally: run `python -m http.server 8000` in this folder and open http://localhost:8000
