# Buena

Property management dashboard for German residential portfolios. Manages WEG (Wohnungseigentümergemeinschaft) and MV (Mietverwaltung) properties with their buildings, units, contacts, and documents.

## Video Demo
[Watch on Loom](https://www.loom.com/share/13c6f097cb43416ea351174378703200)

## Features

- **Properties** — create and manage WEG/MV properties with status tracking (active, pending, archived)
- **Buildings & units** — hierarchical structure: property → buildings → units with inline editing
- **Contacts** — shared manager and accountant directory referenced across properties
- **Documents** — upload documents per property via Vercel Blob
- **AI extraction** — upload a *Teilungserklärung* PDF to auto-populate buildings and units via Mistral OCR
- **Creation wizard** — multi-step form for new properties, with optional PDF-driven prefill

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4, shadcn/ui |
| Database | PostgreSQL (Neon) via Prisma 7 |
| File storage | Vercel Blob |
| AI | Mistral OCR (`mistral-ocr-latest`) |
| Validation | Zod v4 |

## Getting started

```bash
npm install
```

Copy `.env.example` to `.env` and fill in:

```
DATABASE_URL=        # Neon (or any Postgres) connection string
BLOB_READ_WRITE_TOKEN= # Vercel Blob token
MISTRAL_API_KEY=     # Mistral API key
```

```bash
# Apply migrations and start dev server
npm run build   # runs prisma migrate deploy + prisma generate first
npm run dev
```

Seed the database with sample data:

```bash
npm run db:seed
```

## Project structure

```
src/
  app/
    (app)/          # Authenticated pages: /workspace, /properties, /contacts
    api/            # REST API routes
  components/
    ui/             # Shared primitives (Button, Modal, FormField, Toast, …)
    layout/         # AppShell, Sidebar, Topbar
    properties/     # PropertiesTable, detail tabs (General, Buildings, Units, Documents)
    contacts/       # ContactsTable
    wizard/         # Multi-step property creation wizard
  hooks/            # useEditDraft
  lib/              # prisma, api helpers, client fetch utility, Zod schemas
```
