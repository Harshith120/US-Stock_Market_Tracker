require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;

function createApp({ httpClient = axios, finance = yahooFinance } = {}) {
    const app = express();
    app.use(cors());
    app.use(express.json());

    app.get("/api/getStockSymbol/:company", async (req, res) => {
        try {
            const response = await httpClient.get(
                `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(req.params.company)}`,
                { headers: { "User-Agent": "Mozilla/5.0" } },
            );
            const quotes = response.data?.quotes;
            if (quotes?.length) return res.json({ symbol: quotes[0].symbol });
            return res.status(404).json({ error: "Stock not found" });
        } catch (error) {
            console.error("Error fetching stock symbol:", error.message);
            return res.status(500).json({ error: "Failed to fetch stock symbol" });
        }
    });

    app.get("/api/getStockData/:symbol", async (req, res) => {
        try {
            const stockData = await finance.quoteSummary(req.params.symbol.toUpperCase(), {
                modules: ["price", "summaryDetail"],
            });

            if (!stockData?.price) {
                return res.status(404).json({ error: "Stock symbol not found" });
            }

            const stockInfo = {
                symbol: stockData.price.symbol,
                name: stockData.price.longName || stockData.price.shortName,
                price: stockData.price.regularMarketPrice,
                currency: stockData.price.currency,
                change: stockData.price.regularMarketChange,
                percentChange: stockData.price.regularMarketChangePercent,
                high: stockData.summaryDetail?.dayHigh,
                low: stockData.summaryDetail?.dayLow,
                open: stockData.price.regularMarketOpen,
                volume: stockData.summaryDetail?.volume,
                marketState: stockData.price.marketState,
            };
            return res.json(stockInfo);
        } catch (error) {
            console.error("Error fetching stock data:", error.message);
            return res.status(500).json({ error: "Failed to fetch stock data" });
        }
    });

    return app;
}

const app = createApp();
const PORT = process.env.PORT || 5000;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
    });
}

module.exports = { app, createApp };
