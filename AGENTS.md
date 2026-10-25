# Repository Guidelines

## Project Structure & Module Organization

This repository is a client-side React 19 application built with Vite. The app entry points are `src/main.jsx` and `src/App.jsx`; shared tariff data and calculation/export helpers live in `src/constants.js` and `src/utils.js`. Feature views are under `src/components/` (`InputView`, `RatesView`, `HistoryView`, and `ChartsView`), reusable persistence logic is in `src/hooks/`, and global/component styles are in `src/index.css` and `src/App.css`. Static files are served from `public/`; bundled images and the PDF font asset are in `src/assets/`. Tests sit beside the code they cover, such as `src/utils.test.js` and `src/hooks/useLocalStorage.test.js`.

## Build, Test, and Development Commands

Run `npm install` to install dependencies. Use `npm run dev` to start the local Vite server with hot reload, `npm run build` to produce the production bundle in `dist/`, and `npm run preview` to serve that bundle locally. Run `npm run lint` for ESLint checks. Run `npm run test` for the one-shot Vitest suite; use `npm run test:watch` while iterating on tests.

## Coding Style & Naming Conventions

Use the existing JavaScript ES module and React function-component patterns. Keep JSX components in `.jsx` files and utilities/hooks in `.js`; name components and exported React views in PascalCase, hooks with a `use` prefix, and tests with `.test.js` or `.test.jsx`. Match the surrounding two-space indentation and single-quote style. ESLint enforces the configured JavaScript, React Hooks, and React Refresh rules; run it before submitting changes.

## Testing Guidelines

Tests use Vitest, Testing Library, and the `jsdom` environment configured in `vitest.config.js`; `src/test/setup.js` loads shared test matchers. Add tests alongside the relevant utility or hook and name them `*.test.js` or `*.test.jsx`. Cover calculation, storage, and export behavior when changing those paths. There is no stated coverage threshold.

## Commit & Pull Request Guidelines

Recent history favors concise, imperative commit subjects (for example, “Fix CSV encoding for Excel”). Keep each commit focused and describe the user-visible change. Pull requests should summarize the change, note relevant tests (`npm run lint`, `npm run test`, and/or `npm run build`), and include screenshots for visual changes. Link related issues when applicable.

## Security & Data

The app stores entries and tariff rates in browser `localStorage` and has no backend or sync. Avoid adding secrets or sending household billing data to external services; preserve the local-only behavior unless the product requirements explicitly change.
