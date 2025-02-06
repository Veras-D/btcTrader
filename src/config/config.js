module.exports = {
    binance: {
        apiKey: 'sua_api_key',
        apiSecret: 'seu_api_secret'
    },
    database: {
        path: './trades.db'
    },
    trading: {
        symbol: 'BTCUSDT',
        initialBalance: 100,
        leverage: 5, // Alavancagem para futuros
        riskPerTrade: 0.05, // 5% do capital por trade
        indicators: {
            rsi: {
                period: 14,
                overbought: 70,
                oversold: 30
            },
            ema: {
                shortPeriod: 9,
                longPeriod: 21
            }
        }
    },
    server: {
        port: 3000
    }
};