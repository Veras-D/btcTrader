const config = require('../config/config');
const binanceService = require('./binanceService');
const { calculateRSI } = require('../indicators/rsi');
const { calculateEMA } = require('../indicators/ema');
const { saveTrade } = require('../database/queries');

class TradingService {
    constructor() {
        this.position = null;
        this.balance = config.trading.initialBalance;
    }

    async analyzeMarket() {
        const klines = await binanceService.getKlines(
            config.trading.symbol,
            '5m',
            100
        );

        const closes = klines.map(k => k.close);
        const rsi = calculateRSI(closes, config.trading.indicators.rsi.period);
        const shortEMA = calculateEMA(closes, config.trading.indicators.ema.shortPeriod);
        const longEMA = calculateEMA(closes, config.trading.indicators.ema.longPeriod);

        const currentRSI = rsi[rsi.length - 1];
        const currentPrice = closes[closes.length - 1];
        const currentShortEMA = shortEMA[shortEMA.length - 1];
        const currentLongEMA = longEMA[longEMA.length - 1];

        return {
            price: currentPrice,
            rsi: currentRSI,
            shortEMA: currentShortEMA,
            longEMA: currentLongEMA,
            isOverbought: currentRSI > config.trading.indicators.rsi.overbought,
            isOversold: currentRSI < config.trading.indicators.rsi.oversold,
            isCrossOver: currentShortEMA > currentLongEMA
        };
    }

    calculatePositionSize(price) {
        const riskAmount = this.balance * config.trading.riskPerTrade;
        return (riskAmount * config.trading.leverage) / price;
    }

    async executeStrategy() {
        try {
            const analysis = await this.analyzeMarket();
            let action = null;

            // Lógica de entrada
            if (!this.position) {
                if (analysis.isOversold && analysis.isCrossOver) {
                    const quantity = this.calculatePositionSize(analysis.price);
                    const order = await binanceService.createOrder(
                        config.trading.symbol,
                        'BUY',
                        quantity
                    );
                    this.position = { side: 'LONG', entry: analysis.price, quantity };
                    action = 'OPEN_LONG';
                }
            }
            // Lógica de saída
            else if (this.position.side === 'LONG') {
                if (analysis.isOverbought || !analysis.isCrossOver) {
                    await binanceService.createOrder(
                        config.trading.symbol,
                        'SELL',
                        this.position.quantity
                    );
                    const profit = (analysis.price - this.position.entry) * this.position.quantity;
                    this.balance += profit;
                    this.position = null;
                    action = 'CLOSE_LONG';
                }
            }

            if (action) {
                await saveTrade(
                    action,
                    analysis.price,
                    this.position ? this.position.quantity : 0,
                    this.balance,
                    analysis.rsi
                );
            }

            return {
                action,
                analysis,
                balance: this.balance,
                position: this.position
            };
        } catch (error) {
            console.error('Erro na execução da estratégia:', error);
            throw error;
        }
    }
}

module.exports = new TradingService();