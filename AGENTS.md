# Repository Guidelines

## Stack

ShopLedger is a Node.js application using Express 4 and body-parser. It uses CommonJS modules, serves a plain HTML/CSS/JavaScript interface, and stores application data in `data/db.json`.

## Module Map

- `server.js` creates the Express app, serves `public/`, and mounts routes.
- `routes/` contains the product, order, customer, and report API endpoints.
- `lib/` contains domain modules for orders, inventory, pricing, tax, coupons, ledger, invoices, dates, reports, and JSON storage.
- `config.js` contains port, shop, tax, inventory, and coupon settings.
- `public/` contains the frontend; `data/db.json` is the local data store.

## Commands

- `npm start` runs `node server.js` (port 3000 by default; configurable with `PORT`).
- `npm test` currently exits with an error because no test suite is configured.
- `npm install` installs the dependencies declared in `package.json`.

## Change Rules

- Before changing behavior, write characterization tests that capture the current behavior and then update them for the intended change.
- Change only the module the ticket is about. Avoid unrelated cleanup or edits in neighboring modules.
- Tests must never read from or write to `data/db.json`; use isolated test data instead.
- Add no dependencies. Use the packages and tools already available in the repository.
