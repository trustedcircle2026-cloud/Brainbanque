# Brainbanque

Professional advisory, consulting and outsourced-services platform.

## Stack

- React + Vite
- Google Apps Script API
- Google Sheets database
- Google Drive document store

## Development

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and set `VITE_API_URL` to the deployed Apps Script Web App URL.

## Architecture

```
Public React Website
        |
        v
Apps Script API
   |          |
   v          v
Sheets      Drive
```

The public website is intentionally image-light and uses typography, layout, borders and the Brainbanque visual language rather than stock photography.
