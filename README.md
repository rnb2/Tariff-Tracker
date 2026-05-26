# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## The Utility Tracker SPA has been successfully implemented with a modern, responsive design and all requested features.

  #Key Features Implemented:
   - Interactive Data Entry:
       - Full utility block (Heating, Electricity Day/Night, Water, Gas, Rent) with dual-reading inputs and manual sum
         editing.
       - Specialized sections for Parking, Mortgage (ДержМолодь), and a dynamic list for Credit Cards (Mono, PUMB,
         etc.).
   - Live Calculations: The "Total to Pay" card updates instantly as you type, breaking down costs by category.
   - Data Visualization:
       - Trend Graph: Line chart showing spending over time.
       - Distribution Chart: Pie chart highlighting where your money goes.
   - Robust Storage: Integrated with localStorage to persist your history and rates between sessions.
   - Professional Exports:
       - PDF: Generates a clean receipt-style report.
       - CSV: Exports full history for external analysis.
   - Modern UI/UX: Built with React 19, Tailwind CSS 4, and Lucide Icons. The layout is mobile-optimized for easy entry
     while standing at your meters.

  #Technology Stack:
   - Core: React (Vite)
   - Styling: Tailwind CSS
   - Visualization: Recharts
   - Icons: Lucide React
   - PDF Generation: jsPDF + AutoTable
   