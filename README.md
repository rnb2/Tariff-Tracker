# Tariff Tracker

A single-page app for tracking household utility bills, rent, mortgage, and
credit card payments. Enter meter readings each month, get the total due
calculated automatically from configurable tariffs, and review history with
charts. All data is stored locally in the browser — nothing is sent to a
server.

## Features

- **Meter entry** — heating, electricity (day/night), water, gas, rent, with
  automatic sum calculation from current/previous readings and per-unit rates.
- **Other payments** — parking, mortgage installments, and a dynamic list of
  credit card payments.
- **History** — browse and manage past entries.
- **Charts** — spending trend over time and cost distribution by category
  (Recharts).
- **Export** — download history as CSV, or a single entry as a PDF receipt
  (with Cyrillic support).
- **Configurable tariffs** — set your own rate per unit for each utility.

## Data & privacy

All entries and rates are stored in the browser's `localStorage` only. There
is no backend, account, or sync — data stays on the device it was entered on
and is lost if browser storage is cleared. Use the CSV/PDF export regularly
if you want a backup, since there is currently no import mechanism.

## Tech stack

- [React](https://react.dev/) 19 + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/) 4
- [Recharts](https://recharts.org/) for charts
- [jsPDF](https://github.com/parallax/jsPDF) + jspdf-autotable for PDF export
- [Vitest](https://vitest.dev/) + [Testing Library](https://testing-library.com/) for tests

## Getting started

```bash
npm install
npm run dev
```

Then open the printed local URL in your browser.

## Scripts

| Command            | Description                              |
| ------------------ | ----------------------------------------- |
| `npm run dev`       | Start the Vite dev server with HMR        |
| `npm run build`     | Build for production into `dist/`         |
| `npm run preview`   | Preview the production build locally      |
| `npm run lint`      | Run ESLint                                |
| `npm run test`      | Run the test suite once                   |
| `npm run test:watch`| Run tests in watch mode                   |

## Testing

Tests cover the pure calculation/export utilities (`src/utils.js`) and the
`useLocalStorage` hook, using Vitest with a jsdom environment:

```bash
npm run test
```
