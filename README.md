# US Stock Market Tracker

A simple full-stack stock tracker built with Node.js, Express, and vanilla JavaScript. Search for a company name or ticker symbol to view the latest available quote and market information through Yahoo Finance.

## Features

- Search by company name or ticker symbol
- View current price, change, percentage change, and market state
- Display opening price, daily high/low, and trading volume
- Responsive interface
- Node.js proxy endpoints for Yahoo Finance requests

## Tech Stack

- HTML, CSS, and JavaScript
- Node.js
- Express
- Axios
- dotenv
- Node.js test runner

## Prerequisites

- Node.js 18 or newer
- npm

## Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/Harshith120/US-Stock_Market_Tracker.git
   cd US-Stock_Market_Tracker
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

   Update `.env` if needed. The default server port is `5000`.

4. Start the application:

   ```bash
   npm start
   ```

5. Open <http://localhost:5000> in a browser.

For automatic server restarts during development:

```bash
npm run dev
```

## Environment Variables

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `5000` | Port used by the Express server |

## Configuration

The frontend uses `config.js` to configure the backend URL:

```js
window.APP_CONFIG = {
    API_BASE_URL: "http://localhost:5000"
};
```

When deploying the frontend and backend separately, change `API_BASE_URL` to the deployed backend URL. Do not commit secrets in `config.js`.

## Testing

Run the test suite with:

```bash
npm test
```

## API Endpoints

- `GET /api/getStockSymbol/:company` — resolves a company name to a ticker symbol
- `GET /api/getStockData/:symbol` — returns quote data for a ticker symbol

## Project Structure

```text
.
├── index.html       # Application interface
├── app.js           # Frontend API calls and UI updates
├── config.js        # Frontend backend URL configuration
├── server.js        # Express server and Yahoo Finance proxy
├── server.test.js   # API tests
├── package.json     # Scripts and dependencies
└── .env.example     # Example environment variables
```

## Data Source

Stock data is retrieved from Yahoo Finance public endpoints. Quotes may be delayed or temporarily unavailable, and Yahoo Finance may rate-limit requests.

## License

No license is currently specified for this repository.
