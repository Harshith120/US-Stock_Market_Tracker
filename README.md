# US Stock Market Tracker

A small web app for searching US stocks and viewing current market information from Yahoo Finance.

![US Stock Market Tracker screenshot](Stock%20market%20tracker.png)

## Requirements

- Node.js 18 or newer
- npm

## Setup

1. Clone the repository and enter its directory.
2. Install dependencies:

   ```sh
   npm install
   ```

3. (Optional) Copy `.env.example` to `.env` and set the server port.
4. Start the API server:

   ```sh
   npm start
   ```

   The server listens on port `5000` by default (or the value of `PORT` in `.env`).
5. Serve `index.html` and `app.js` from a static web server. The frontend calls the API on the same origin by default. To use a separately hosted API, set `window.STOCK_API_BASE_URL` before loading `app.js`, for example:

   ```html
   <script>window.STOCK_API_BASE_URL = "http://localhost:5000";</script>
   <script defer src="app.js"></script>
   ```

   Set it to the API server's origin without a trailing slash. The backend enables CORS for cross-origin frontend hosting.

## API

- `GET /api/getStockSymbol/:company` — searches Yahoo Finance and returns the first matching ticker.
- `GET /api/getStockData/:symbol` — returns quote and market details for a ticker.

## Tests

Run the endpoint tests with:

```sh
npm test
```
