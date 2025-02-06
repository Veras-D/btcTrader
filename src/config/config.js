require('dotenv').config();

module.exports = {
    binance: {
        apiKey: process.env.BINANCE_API_KEY_TEST,
        apiSecret: process.env.BINANCE_API_SECRET_TEST
    },
    database: {
        path: process.env.DB_PATH || './trades.db'
    },
    trading: {
        symbol: 'BTCUSDT',
        initialBalance: parseFloat(process.env.INITIAL_BALANCE) || 100,
        leverage: parseInt(process.env.LEVERAGE) || 10,
        riskPerTrade: parseFloat(process.env.RISK_PER_TRADE) || 0.05,
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
        port: parseInt(process.env.PORT) || 3000
    }
};