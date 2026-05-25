# HIMAIDE Admin Hub

Pusat Informasi Administrasi HIMAIDE ITS — built with Next.js 15 + TypeScript.

## SEO & Social Preview

| Item | Lokasi |
|---|---|
| Metadata (title, description, OG, Twitter) | `src/app/layout.tsx` |
| Nilai yang bisa diedit (url, keywords, dll) | `src/config/site.ts` |
| Favicon | `public/assets/favicon.svg` |
| OG Image | `public/assets/og-image.jpg` |

> **Setelah deploy final**, ganti `siteConfig.url` di `src/config/site.ts` dari `https://himaide-adminhub.vercel.app` ke domain yang sebenarnya agar OG tags dan `metadataBase` benar.

## Running Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
GOOGLE_CALENDAR_GAS_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

If `GOOGLE_CALENDAR_GAS_ENDPOINT` is not set, the calendar will show fallback demo events.

## Google Calendar via Google Apps Script (GAS)

1. Open [script.google.com](https://script.google.com) and create a new project.
2. Paste the following code:

```javascript
function doGet() {
  const calendarId = "YOUR_CALENDAR_ID";
  const calendar = CalendarApp.getCalendarById(calendarId);
  const now = new Date();
  const end = new Date();
  end.setDate(now.getDate() + 30);
  const events = calendar.getEvents(now, end).map(event => ({
    title: event.getTitle(),
    start: event.getStartTime().toISOString(),
    end: event.getEndTime().toISOString(),
    location: event.getLocation(),
    description: event.getDescription(),
  }));
  return ContentService
    .createTextOutput(JSON.stringify(events))
    .setMimeType(ContentService.MimeType.JSON);
}
```

3. Replace `YOUR_CALENDAR_ID` with your Google Calendar ID (found in Calendar settings → Integrate calendar).
4. Deploy as **Web App** → Execute as **Me** → Who has access: **Anyone**.
5. Copy the deployment URL and set it as `GOOGLE_CALENDAR_GAS_ENDPOINT` in `.env.local`.

## Where to Edit Content

| What to edit | File |
|---|---|
| Contacts (name, WA, role) | `src/config/contacts.ts` |
| Card/modal content (Proker, Fungsio) | `src/config/cards.ts` |
| System links (Surat Keluar, Zoom, etc.) | `src/config/links.ts` |
| Document links (AD/ART, GBHK, TKO) | `src/config/documents.ts` |
| Social media links | `src/config/socials.ts` |
| FAB WhatsApp target | `src/config/actions.ts` |
| Location info | `src/config/locations.ts` |
| Site name, tagline | `src/config/site.ts` |
| Calendar fallback events | `src/config/calendar.ts` |

## Deployment (Vercel)

1. Push to a GitHub repo.
2. Import in [vercel.com](https://vercel.com).
3. Add `GOOGLE_CALENDAR_GAS_ENDPOINT` in Vercel environment variables.
4. Deploy.

The app is a static-first SPA with API route caching — it deploys cleanly on Vercel free tier.
