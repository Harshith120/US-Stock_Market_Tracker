require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const yahooFinance = require("yahoo-finance2").default;

const app = express();
app.use(cors());
app.use(express.json());

// Fetch Stock Symbol from Yahoo Finance
app.get("/api/getStockSymbol/:company", async (req, res) => {
    const companyName = req.params.company;

    try {
        const response = await axios.get(`https://query2.finance.yahoo.com/v1/finance/search?q=${companyName}`, {
            headers: { "User-Agent": "Mozilla/5.0" },
        });

        const data = response.data;
        if (data.quotes && data.quotes.length > 0) {
            res.json({ symbol: data.quotes[0].symbol });
        } else {
            res.status(404).json({ error: "Stock not found" });
        }
    } catch (error) {
        console.error("Error fetching stock symbol:", error.message);
        res.status(500).json({ error: "Failed to fetch stock symbol" });
    }
});

// Fetch Stock Data from Yahoo Finance
app.get("/api/getStockData/:symbol", async (req, res) => {
    const stockSymbol = req.params.symbol.toUpperCase();

    try {
        const stockData = await yahooFinance.quoteSummary(stockSymbol, { modules: ["price", "summaryDetail"] });

        if (!stockData || !stockData.price) {
            return res.status(404).json({ error: "Stock symbol not found" });
        }

        const stockInfo = {
            symbol: stockData.price.symbol,
            name: stockData.price.longName || stockData.price.shortName,
            price: stockData.price.regularMarketPrice,
            currency: stockData.price.currency,
            change: stockData.price.regularMarketChange,
            percentChange: stockData.price.regularMarketChangePercent,
            high: stockData.summaryDetail.dayHigh,
            low: stockData.summaryDetail.dayLow,
            open: stockData.price.regularMarketOpen,
            volume: stockData.summaryDetail.volume,
            marketState: stockData.price.marketState,
        };

        res.json(stockInfo);
    } catch (error) {
        console.error("Error fetching stock data:", error.message);
        res.status(500).json({ error: "Failed to fetch stock data" });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
});
