# Sano Nepal — Restaurant Website

Single-page website for **Sano Nepal**, a Nepalese restaurant in Sörnäinen, Helsinki.

## Structure

- `index.html` — one self-contained file with inline CSS and JavaScript (no build step, no dependencies)
- `assets2/` — photography used across the page (dish cards and gallery images)

## Features

- **Bilingual FI / EN toggle** — every text node carries `data-fi` / `data-en` attributes, swapped by a small JavaScript toggle; Finnish is the default
- **Table booking via WhatsApp** — the reservation form composes a pre-filled message and opens a `wa.me` link, so booking requests land directly on the restaurant's phone
- **Google Fonts** — Playfair Display for headings, Outfit for body text
- Links out to the restaurant's Wolt page, Instagram, and phone number

## Preview locally

Open `index.html` in any browser, or serve the folder:

```sh
python -m http.server 8000
# then visit http://localhost:8000
```
