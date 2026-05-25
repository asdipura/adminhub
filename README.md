<p align="center">
  <img src="public/assets/logos/himaide-logo.svg" alt="HIMAIDE" width="80" />
</p>

# HIMAIDE Admin Hub

**Pusat Informasi Administrasi HIMAIDE ITS**
Platform web internal untuk akses cepat ke proposal, surat, LPJ/SPJ, kontak pengurus, dokumen organisasi, kalender kegiatan, dan sistem pendukung administrasi.

Built with **Next.js 15 + TypeScript** — deployable on Vercel free tier.

---

## Daftar Isi

- [Struktur Project](#struktur-project)
- [Menjalankan Lokal](#menjalankan-lokal)
- [Environment Variables](#environment-variables)
- [Google Calendar via GAS](#google-calendar-via-gas)
- [Panduan Edit Konten](#panduan-edit-konten)
- [SEO & Social Preview](#seo--social-preview)
- [Deploy ke Vercel](#deploy-ke-vercel)
- [Regenerasi Kabinet](#regenerasi-kabinet)
- [Regeneration / Refactor Guide](#regeneration--refactor-guide)

---

## Struktur Project

```
src/
├── app/
│   ├── layout.tsx          # HTML shell, metadata SEO, Google Fonts
│   ├── page.tsx            # Root page, router antar halaman (Home/About/Kontak)
│   ├── globals.css         # Seluruh CSS global — dark theme, animasi, variabel
│   └── api/calendar/
│       └── route.ts        # API route: proxy ke Google Calendar GAS
│
├── components/
│   ├── layout/             # Navbar, Footer
│   ├── sections/           # HeroSection, ShortcutSection, MainContentSection,
│   │                       # AboutPage, ContactPage
│   ├── calendar/           # WeekCalendar
│   ├── cards/              # InfoCard, CardModal
│   ├── contact/            # ContactList, ContactCard, ContactControls
│   └── ui/                 # FAB
│
├── config/                 # Seluruh data yang bisa diedit (lihat bagian Edit Konten)
├── lib/                    # Utility functions
└── types/                  # TypeScript type definitions

public/
└── assets/
    ├── favicon.svg
    ├── og-image.jpg
    ├── adminhub-wordmark.svg
    └── logos/
        └── himaide-logo.svg
```

---

## Menjalankan Lokal

> Untuk performa hot reload terbaik di WSL, jalankan dari Linux filesystem (`~/projects/adminhub`), bukan dari `/mnt/d/...`.

```bash
# Install dependencies
npm install

# Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

```bash
# Build production
npm run build

# Jalankan production build
npm start
```

---

## Environment Variables

Buat file `.env.local` di root project (tidak di-commit ke Git):

```env
GOOGLE_CALENDAR_GAS_ENDPOINT=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

Lihat `.env.example` sebagai referensi. Jika variabel tidak diset, kalender akan menampilkan fallback events dari `src/config/calendar.ts`.

---

## Google Calendar via GAS

Website menggunakan **Google Apps Script (GAS) Web App** sebagai bridge ke Google Calendar. Frontend tidak fetch langsung ke GAS — semua melalui `/api/calendar`.

```
WeekCalendar → /api/calendar → GAS Web App → Google Calendar
```

### Setup GAS

1. Buka [script.google.com](https://script.google.com) → buat project baru
2. Paste kode berikut ke `Code.gs`:

```javascript
function doGet() {
  const CALENDAR_IDS = [
    "kalender_utama@group.calendar.google.com", // ganti dengan Calendar ID kamu
    // tambahkan ID kalender lain jika perlu
  ];

  try {
    const now = new Date();
    const end = new Date();
    end.setDate(now.getDate() + 30);
    const allEvents = [];

    CALENDAR_IDS.forEach(function(id) {
      const calendar = CalendarApp.getCalendarById(id);
      if (!calendar) return;
      calendar.getEvents(now, end).forEach(function(event) {
        allEvents.push({
          title: event.getTitle(),
          start: event.getStartTime().toISOString(),
          end: event.getEndTime().toISOString(),
          location: event.getLocation(),
          description: event.getDescription(),
          isAllDay: event.isAllDayEvent(),
          calendarName: calendar.getName(),
        });
      });
    });

    allEvents.sort(function(a, b) {
      return new Date(a.start) - new Date(b.start);
    });

    return ContentService
      .createTextOutput(JSON.stringify(allEvents))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: e.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Ganti `CALENDAR_IDS` dengan Calendar ID milikmu (Google Calendar → Settings kalender → **Integrate calendar** → Calendar ID)
4. **Deploy** → New Deployment → Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. Copy URL deployment → paste ke `.env.local` sebagai `GOOGLE_CALENDAR_GAS_ENDPOINT`
6. Untuk update kode GAS: **Manage Deployments** → buat **New Version** (jangan buat deployment baru, URL akan berubah)

---

## Panduan Edit Konten

Semua konten yang bisa diedit ada di `src/config/`. **Tidak perlu menyentuh komponen atau CSS.**

| Yang ingin diedit | File |
|---|---|
| Identitas site (nama, deskripsi, URL, keywords) | `src/config/site.ts` |
| Item navigasi navbar | `src/config/navigation.ts` |
| Data kontak pengurus (nama, WA, jabatan) | `src/config/contacts.ts` |
| Card & modal Proker/Fungsio (isi, tombol, format copy) | `src/config/cards.ts` |
| Link sistem (Surat Keluar, Zoom, Notulensi, dll) | `src/config/links.ts` |
| Dokumen organisasi (AD/ART, GBHO, TKO) | `src/config/documents.ts` |
| Social media (Instagram, YouTube, LinkedIn, X) | `src/config/socials.ts` |
| Lokasi (Ruang Sekretariat, ITS Merch) | `src/config/locations.ts` |
| Aksi FAB & CTA (target WA, link bayar kas) | `src/config/actions.ts` |
| Kalender (timezone, fallback events) | `src/config/calendar.ts` |

### Format nomor WhatsApp di `contacts.ts`

Nomor harus dalam format internasional tanpa `+` atau spasi:
```ts
whatsapp: '628123456789'  // ✅ benar
whatsapp: '08123456789'   // ❌ salah
whatsapp: '+62 812-3456'  // ❌ salah
```

---

## SEO & Social Preview

| Item | Lokasi |
|---|---|
| Metadata (title, OG, Twitter, robots) | `src/app/layout.tsx` |
| Nilai editable (url, keywords, creator) | `src/config/site.ts` |
| Favicon | `public/assets/favicon.svg` |
| OG Image (1200×630) | `public/assets/og-image.jpg` |

> Setelah deploy final, ganti `siteConfig.url` di `src/config/site.ts` ke domain yang sebenarnya.

---

## Deploy ke Vercel

1. Push repo ke GitHub
2. Buka [vercel.com](https://vercel.com) → **New Project** → import repo
3. Tambahkan environment variable:
   - Key: `GOOGLE_CALENDAR_GAS_ENDPOINT`
   - Value: URL GAS deployment
4. **Deploy**

Re-deploy selanjutnya otomatis saat `git push` ke branch utama.

> Setelah dapat URL Vercel, update `siteConfig.url` di `src/config/site.ts` dan push ulang.

---

## Regenerasi Kabinet

Panduan untuk pengurus baru yang mengambil alih project di periode kabinet berikutnya.

### Yang perlu diperbarui setiap pergantian kabinet

**1. Data kontak pengurus** → `src/config/contacts.ts`
- Ganti seluruh array `contacts` dengan pengurus baru
- Pastikan format nomor WA benar (lihat format di atas)
- Update `id` kontak jika ada perubahan jabatan

**2. Identitas kabinet** → `src/config/site.ts`
- Update field `cabinet` ke nama kabinet baru

**3. Aksi FAB & CTA** → `src/config/actions.ts`
- Update `contactId` yang direferensikan jika jabatan berubah
- Pastikan ID kontak di `actions.ts` cocok dengan ID di `contacts.ts`

**4. Google Calendar** → `.env.local` + Vercel Environment Variables
- Jika akun Google berubah, buat GAS deployment baru
- Update `GOOGLE_CALENDAR_GAS_ENDPOINT` di `.env.local` dan Vercel

**5. Asset visual** (jika perlu) → `public/assets/`
- `og-image.jpg` — ganti jika branding berubah
- `favicon.svg` — ganti jika logo berubah
- `logos/himaide-logo.svg` — ganti jika logo berubah
- `adminhub-wordmark.svg` — ganti jika wordmark berubah

**6. Konten card/modal** → `src/config/cards.ts`
- Update link template, contoh, dan sistem yang berubah
- Update format copy konsumsi/merch jika ada perubahan SOP

### Checklist serah terima

- [ ] Data kontak pengurus baru sudah diupdate di `contacts.ts`
- [ ] Nama kabinet sudah diupdate di `site.ts`
- [ ] Google Calendar baru sudah dihubungkan (GAS + env variable)
- [ ] Link sistem (surat keluar, zoom, dll) masih aktif — cek di `links.ts`
- [ ] Dokumen AD/ART, GBHO, TKO masih bisa dibuka — cek di `documents.ts`
- [ ] Social media masih aktif — cek di `socials.ts`
- [ ] `npm run build` sukses
- [ ] Website berjalan normal di `npm run dev`
- [ ] Deploy ke Vercel berhasil

### Cara serah terima akses

1. **GitHub repo** — tambahkan akun GitHub pengurus baru sebagai collaborator
2. **Vercel** — transfer ownership project atau tambahkan sebagai member tim
3. **Google Apps Script** — share GAS project ke akun Google pengurus baru
4. **Google Calendar** — share kalender HIMAIDE ke akun baru dengan akses edit

---

## Regeneration / Refactor Guide

> Untuk maintainer yang perlu update besar atau refactor ulang dari HTML sumber.

### 1. Purpose

Project ini di-refactor dari satu file HTML besar (`himaide_merged3page.html`) menjadi arsitektur modular:
- **Next.js App Router** — routing dan pemisahan server/client component
- **TypeScript components** — di `src/components/`
- **Config files** — konten yang bisa diedit di `src/config/`
- **Public assets** — SVG logo dan wordmark di `public/assets/`
- **API route** — Google Calendar bridge di `src/app/api/calendar/route.ts`

### 2. Source of Truth

Setelah refactor, **file HTML lama bukan lagi source of truth.**

| Apa | Di mana |
|---|---|
| Struktur UI | `src/components/` |
| Konten yang bisa diedit | `src/config/` |
| Asset visual | `public/assets/` |
| Calendar API bridge | `src/app/api/calendar/route.ts` |
| Runtime secrets | `.env.local` / Vercel Environment Variables |

File HTML lama hanya digunakan sebagai **referensi visual/konten** saat membandingkan regresi.

### 3. Kapan Perlu Regenerasi

**Regenerasi penuh hanya jika:**
- HTML sumber berubah signifikan (section baru, halaman baru, redesign)
- Redesign besar dilakukan di luar project Next.js
- Project sudah terlalu jauh drift dari desain sumber
- Banyak fitur/konten/asset yang hilang secara tidak sengaja

**Edit kecil tidak perlu regenerasi.** Edit langsung di:
```
src/config/*.ts          → kontak, link, kartu, aksi, dll
src/components/...       → markup dan behavior komponen
src/app/globals.css      → CSS global, variabel, animasi
public/assets/...        → logo SVG, wordmark SVG
```

### 4. Aturan Regenerasi

- [ ] Jangan hapus copy user-facing
- [ ] Jangan hapus link (kosongkan + `// TODO` jika tidak diketahui)
- [ ] Jangan hapus konten card atau modal
- [ ] Jangan hapus behavior kalender atau fallback events
- [ ] Jangan hapus fitur search, filter, sort di halaman kontak
- [ ] Jangan hapus mobile navbar behavior
- [ ] Jangan hapus hero canvas effects (grid, hover, noise)
- [ ] Jangan rekonstruksi logo HIMAIDE atau wordmark Admin Hub sebagai teks biasa
- [ ] Pertahankan desain visual sebelum memperbaiki struktur kode
- [ ] Pindahkan konten hardcoded/berulang ke `src/config/*.ts`
- [ ] Logo HIMAIDE harus dari `public/assets/logos/himaide-logo.svg`
- [ ] Admin Hub wordmark harus dari `public/assets/adminhub-wordmark.svg`
- [ ] Google Calendar tetap di belakang `/api/calendar` — jangan fetch GAS dari client
- [ ] Jangan expose secrets atau hardcode URL private

### 5. Aturan Asset

| File | Digunakan sebagai |
|---|---|
| `public/assets/adminhub-wordmark.svg` | `<img src="/assets/adminhub-wordmark.svg" alt="Admin Hub" />` |
| `public/assets/logos/himaide-logo.svg` | `<img src="/assets/logos/himaide-logo.svg" alt="HIMA IDE" />` |

- Selalu referensikan via URL path (`/assets/...`), bukan path filesystem
- Jangan inline SVG besar ke dalam React component
- Jika asset tidak muncul (hanya alt text), pastikan file ada di `public/assets/` di direktori project yang **aktif**
- Setelah copy project ke lokasi baru, selalu verifikasi `public/assets/` sudah terisi

### 6. Prompt Regenerasi untuk Claude Code

````
You are maintaining a Next.js + TypeScript project that was originally refactored from a single-file HTML web app.

Your task is to regenerate or update the project from the latest original HTML source while preserving the current modular architecture.

Goals:
- Preserve every user-facing copy exactly unless explicitly instructed otherwise.
- Preserve every section, card, modal, link, CTA, contact, calendar event behavior, navbar interaction, mobile behavior, animation, and responsive layout.
- Preserve the existing dark visual identity, glassmorphism, gradients, spacing, typography, hover states, and hero canvas effects.
- Do not recreate HIMAIDE logo or Admin Hub wordmark as normal text.
- Use external assets: `/assets/adminhub-wordmark.svg` and `/assets/logos/himaide-logo.svg`
- Keep Google Calendar integration through `/api/calendar`.
- Do not fetch Google Apps Script directly from client components.
- Keep editable content in `src/config/*.ts`.
- Keep reusable UI in `src/components/`.
- Keep global styling in `src/app/globals.css`.
- Do not remove existing config files.
- Do not expose secrets or hardcode private URLs.
- Do not initialize git. Do not deploy.

Process:
1. Inspect the current project structure.
2. Inspect the latest original HTML source.
3. Identify differences in: copy, links, card content, modal content, contacts, hero assets, calendar UI, navbar/mobile menu, footer, responsive behavior.
4. Apply only the required changes to the Next.js project.
5. Move repeated or editable data into the appropriate config files.
6. Preserve external logo/wordmark assets in `public/assets`.
7. Run `npm run build` and fix all errors.
8. Report: files changed, content restored, config values added, missing TODO values, build result.
````

### 7. Checklist Verifikasi Pasca Regenerasi

- [ ] `npm run build` sukses tanpa error
- [ ] Homepage render normal
- [ ] Logo HIMAIDE muncul dari file asset (bukan alt text)
- [ ] Admin Hub wordmark muncul dari file asset (bukan alt text)
- [ ] Navbar desktop berfungsi (active state, perpindahan halaman)
- [ ] Burger menu mobile berfungsi (buka, tutup, navigasi)
- [ ] FAB muncul dan trigger aksi WhatsApp yang benar
- [ ] Card Proker dan Fungsio muncul dan modal bisa dibuka
- [ ] Segmented tabs (Proker / Fungsio) berpindah dengan benar
- [ ] Link footer "Lembaran Proker" membuka modal yang sesuai
- [ ] Kalender mingguan muncul dengan grid hari dan daftar event
- [ ] `/api/calendar` tidak crash saat env tidak diset
- [ ] Search kontak berfungsi
- [ ] Filter kategori kontak berfungsi
- [ ] Link WhatsApp kontak terbuka dengan benar
- [ ] Konten halaman About utuh
- [ ] Link footer (Sistem, OS File, Social Media) mengarah ke URL yang benar
- [ ] Tidak ada asset SVG yang di-inline sebagai JSX besar di komponen
- [ ] Tidak ada secret atau URL private yang ter-commit

### 8. Git Workflow untuk Regenerasi

```bash
# 1. Snapshot sebelum perubahan besar
git add -p
git commit -m "chore: snapshot before regeneration"

# 2. Lakukan perubahan regenerasi

# 3. Verifikasi build
npm run build

# 4. QA manual di browser
npm run dev

# 5. Commit setelah QA berhasil
git add -p
git commit -m "chore: regenerate from updated HTML source"
```

> Jangan skip commit sebelum regenerasi. Jika ada yang salah, kamu butuh rollback point yang bersih.
