require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

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
        const response = await axios.get(
            `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(stockSymbol)}`,
            {
                params: { interval: "1d", range: "1d" },
                headers: { "User-Agent": "Mozilla/5.0" },
                timeout: 10000,
            }
        );
        const stockData = response.data?.chart?.result?.[0];

        if (!stockData) {
            return res.status(404).json({ error: "Stock symbol not found" });
        }

        const { meta, indicators } = stockData;
        const quote = indicators?.quote?.[0] || {};
        const currentPrice = meta.regularMarketPrice;
        const previousClose = meta.chartPreviousClose;
        const change = meta.fulldayChange ?? currentPrice - previousClose;
        const percentChange = meta.fulldayChangePercent
            ?? (previousClose ? (change / previousClose) * 100 : 0);
        const now = Math.floor(Date.now() / 1000);
        const marketState = ["pre", "regular", "post"].find((state) => {
            const period = meta.currentTradingPeriod?.[state];
            return period && now >= period.start && now < period.end;
        })?.toUpperCase() || "CLOSED";

        const stockInfo = {
            symbol: meta.symbol,
            name: meta.longName || meta.shortName || meta.symbol,
            price: currentPrice,
            currency: meta.currency,
            change,
            percentChange,
            high: meta.regularMarketDayHigh ?? quote.high?.[0],
            low: meta.regularMarketDayLow ?? quote.low?.[0],
            open: quote.open?.[0],
            volume: meta.regularMarketVolume ?? quote.volume?.[0],
            marketState,
        };

        res.json(stockInfo);
    } catch (error) {
        console.error("Error fetching stock data:", error.message);
        const isRateLimited = error.response?.status === 429;
        res.status(isRateLimited ? 503 : 502).json({
            error: isRateLimited
                ? "Yahoo Finance is temporarily rate-limiting requests. Please try again later."
                : "Failed to fetch stock data from Yahoo Finance",
        });
    }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
