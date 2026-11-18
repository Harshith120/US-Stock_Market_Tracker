const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../server");

let server;
let baseUrl;

before(async () => {
    const httpClient = {
        get: async () => ({ data: { quotes: [{ symbol: "AAPL" }] } }),
    };
    const finance = { quoteSummary: async () => null };
    server = createApp({ httpClient, finance }).listen(0);
    await new Promise((resolve) => server.once("listening", resolve));
    baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
});

test("returns the matching ticker when a company is found", async () => {
    const response = await fetch(`${baseUrl}/api/getStockSymbol/Apple`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { symbol: "AAPL" });
});

test("returns 404 when no matching company is found", async () => {
    const app = createApp({
        httpClient: { get: async () => ({ data: { quotes: [] } }) },
        finance: { quoteSummary: async () => null },
    });
    const notFoundServer = app.listen(0);
    await new Promise((resolve) => notFoundServer.once("listening", resolve));
    try {
        const response = await fetch(`http://127.0.0.1:${notFoundServer.address().port}/api/getStockSymbol/Unknown`);
        assert.equal(response.status, 404);
        assert.deepEqual(await response.json(), { error: "Stock not found" });
    } finally {
        await new Promise((resolve, reject) => notFoundServer.close((error) => error ? reject(error) : resolve()));
    }
});

test("returns 500 when the upstream search request fails", async () => {
    const app = createApp({
        httpClient: { get: async () => { throw new Error("upstream unavailable"); } },
        finance: { quoteSummary: async () => null },
    });
    const errorServer = app.listen(0);
    await new Promise((resolve) => errorServer.once("listening", resolve));
    try {
        const response = await fetch(`http://127.0.0.1:${errorServer.address().port}/api/getStockSymbol/Apple`);
        assert.equal(response.status, 500);
        assert.deepEqual(await response.json(), { error: "Failed to fetch stock symbol" });
    } finally {
        await new Promise((resolve, reject) => errorServer.close((error) => error ? reject(error) : resolve()));
    }
});
