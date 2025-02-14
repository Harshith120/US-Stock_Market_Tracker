async function fetchStock() {
    const companyName = document.getElementById("stockSymbol").value.trim();
    if (!companyName) return alert("Please enter a stock name!");

    try {
        // Fetch Stock Symbol from Backend Proxy
        const symbolResponse = await fetch(`http://localhost:5000/api/getStockSymbol/${companyName}`);
        const symbolData = await symbolResponse.json();

        if (!symbolData.symbol) {
            alert("Stock not found. Please enter a valid stock name.");
            return;
        }

        // Fetch Stock Data from Backend Proxy
        const stockResponse = await fetch(`http://localhost:5000/api/getStockData/${symbolData.symbol}`);
        const stockData = await stockResponse.json();

        updateUI(stockData);
    } catch (error) {
        console.error("Error fetching stock data:", error);
        document.getElementById("stockDetails").innerHTML = `<p class="text-danger">Failed to fetch stock data.</p>`;
    }
}

function updateUI(data) {
    document.getElementById("stockName").innerText = `${data.name}`;
    document.getElementById("stockPrice").innerText = `💰 ${data.currency} ${data.price.toFixed(2)}`;

    const changeText = `${data.change.toFixed(2)} (${data.percentChange.toFixed(2)}%)`;
    document.getElementById("stockChange").innerText = `Change: ${changeText}`;
    document.getElementById("stockChange").style.color = data.change >= 0 ? "green" : "red";

    document.getElementById("marketState").innerText = `Market State: ${data.marketState}`;
    document.getElementById("stockOpen").innerText = `Open: ${data.currency} ${data.open?.toFixed(2) || "N/A"}`;
    document.getElementById("stockHighLow").innerText = `High: ${data.currency} ${data.high?.toFixed(2) || "N/A"} | Low: ${data.currency} ${data.low?.toFixed(2) || "N/A"}`;
    document.getElementById("stockVolume").innerText = `Volume: ${data.volume?.toLocaleString() || "N/A"}`;
}

window.fetchStock = fetchStock;
