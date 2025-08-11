"use client";

import { useEffect } from "react";

export default function TradingViewTicker() {
    useEffect(() => {
        const script = document.createElement("script");
        script.src =
            "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
        script.async = true;
        script.innerHTML = JSON.stringify({
            symbols: [
                { proName: "FOREXCOM:SPXUSD", title: "S&P 500" },
                { proName: "FOREXCOM:NSXUSD", title: "US 100" },
                { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
                { proName: "NASDAQ:AAPL", description: "" },
                { proName: "NASDAQ:TSLA", description: "" },
                { proName: "NASDAQ:AMZN", description: "" },
                { proName: "NASDAQ:META", description: "" },
                { proName: "AMEX:SPY", description: "" },
                { proName: "NASDAQ:QQQ", description: "" },
                { proName: "NASDAQ:NVDA", description: "" },
            ],
            showSymbolLogo: true,
            colorTheme: "dark",
            isTransparent: false,
            displayMode: "compact",
            locale: "en",
        });
        document
            .querySelector(".tradingview-widget-container__widget")
            ?.appendChild(script);
    }, []);

    return (
        <div className="tradingview-widget-container">
            <div className="tradingview-widget-container__widget"></div>
        </div>
    );
}
