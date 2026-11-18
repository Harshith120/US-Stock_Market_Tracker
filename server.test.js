const assert = require("node:assert/strict");
const { after, before, test } = require("node:test");
const axios = require("axios");
const app = require("./server");

let server;
let baseUrl;
const originalAxiosGet = axios.get;

before(async () => {
    await new Promise((resolve, reject) => {
        server = app.listen(0, resolve);
        server.once("error", reject);
    });
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => {
        server.close((error) => error ? reject(error) : resolve());
    });
    axios.get = originalAxiosGet;
});

async function withAxiosGet(mock, run) {
    axios.get = mock;
    try {
        await run();
    } finally {
        axios.get = originalAxiosGet;
    }
}

test("resolves a company and returns its stock quote", async () => {
    await withAxiosGet(async (url) => {
        if (url.includes("/finance/search?")) {
            return { data: { quotes: [{ symbol: "AAPL" }] } };
        }

        assert.match(url, /\/chart\/AAPL$/);
        return {
            data: {
                chart: {
                    result: [{
                        meta: {
                            symbol: "AAPL",
                            longName: "Apple Inc.",
                            currency: "USD",
                            regularMarketPrice: 185,
                            chartPreviousClose: 180,
                            fulldayChange: 5,
                            fulldayChangePercent: 2.78,
                            regularMarketDayHigh: 187,
                            regularMarketDayLow: 180,
                            regularMarketVolume: 1234,
                            currentTradingPeriod: {
                                regular: { start: 0, end: 4102444800 },
                            },
                        },
                        indicators: {
                            quote: [{ open: [181] }],
                        },
                    }],
                },
            },
        };
    }, async () => {
        const symbolResponse = await fetch(`${baseUrl}/api/getStockSymbol/Apple`);
        assert.equal(symbolResponse.status, 200);
        assert.deepEqual(await symbolResponse.json(), { symbol: "AAPL" });

        const stockResponse = await fetch(`${baseUrl}/api/getStockData/AAPL`);
        assert.equal(stockResponse.status, 200);
        assert.deepEqual(await stockResponse.json(), {
            symbol: "AAPL",
            name: "Apple Inc.",
            price: 185,
            currency: "USD",
            change: 5,
            percentChange: 2.78,
            high: 187,
            low: 180,
            open: 181,
            volume: 1234,
            marketState: "REGULAR",
        });
    });
});

test("returns 404 when no stock quote is found", async () => {
    await withAxiosGet(async () => ({
        data: { chart: { result: null, error: { code: "Not Found" } } },
    }), async () => {
        const response = await fetch(`${baseUrl}/api/getStockData/INVALID`);
        assert.equal(response.status, 404);
        assert.deepEqual(await response.json(), { error: "Stock symbol not found" });
    });
});

test("returns 503 when Yahoo Finance rate-limits a quote request", async () => {
    await withAxiosGet(async () => {
        const error = new Error("Too Many Requests");
        error.response = { status: 429 };
        throw error;
    }, async () => {
        const response = await fetch(`${baseUrl}/api/getStockData/AAPL`);
        assert.equal(response.status, 503);
        assert.deepEqual(await response.json(), {
            error: "Yahoo Finance is temporarily rate-limiting requests. Please try again later.",
        });
    });
});
