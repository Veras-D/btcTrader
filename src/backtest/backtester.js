const binanceService = require("../services/binanceService");
const { calculateBollingerBands } = require("../indicators/bollingerBands");
const config = require("../config/config");

class Backtester {
    constructor(initialBalance = 100) {
        this.initialBalance = initialBalance;
        this.balance = initialBalance;
        this.position = null;
        this.trades = [];
        this.stats = {
            totalTrades: 0,
            winningTrades: 0,
            losingTrades: 0,
            profitFactor: 0,
            totalProfit: 0,
            maxDrawdown: 0,
            winRate: 0,
        };
    }

    async getHistoricalData(startTime, endTime) {
        try {
            const klines = await binanceService.getKlines(
                config.trading.symbol,
                "1h",
                1000,
                startTime,
                endTime
            );
            return klines;
        } catch (error) {
            console.error("Erro ao obter dados históricos:", error);
            throw error;
        }
    }

    analyzeCandles(candles) {
        const closes = candles.map((k) => k.close);
        const bollingerBands = calculateBollingerBands(closes, 20, 2.5);
        return candles.map((candle, i) => {
            if (i > 980) return null;

            return {
                timestamp: candle.timestamp,
                price: candle.close,
                lowerBand: bollingerBands[i].lower,
                upperBand: bollingerBands[i].upper,
                middleBand: bollingerBands[i].middle,
                isBuySignal: candle.close <= bollingerBands[i].lower,
                isSellSignal: candle.close >= bollingerBands[i].upper,
            };
        }).filter((x) => x !== null);
    }

    executeTrade(signal, price) {
        const tradeSize = (this.balance * 0.2) * 5; // 20% de banca com alavancagem 5x

        if (!this.position && signal.isBuySignal) {
            this.position = {
                type: "LONG",
                entry: price,
                size: tradeSize,
                timestamp: signal.timestamp,
            };
            return "OPEN_LONG ";
        } else if (this.position?.type === "LONG" && signal.isSellSignal) {
            const profit = (price - this.position.entry) * this.position.size;
            this.balance += profit;

            this.trades.push({
                entry: this.position.entry,
                exit: price,
                profit: profit,
                profitPercentage: (profit / this.balance) * 100,
                type: "LONG",
                entryTime: this.position.timestamp,
                exitTime: signal.timestamp,
            });
            this.position = null;
            return "CLOSE_LONG";
        }
        return null;
    }

    calculateStatistics() {
        const profits = this.trades.map((t) => t.profit);
        const winningTrades = profits.filter((p) => p > 0);
        const losingTrades = profits.filter((p) => p < 0);

        const totalProfit = profits.reduce((a, b) => a + b, 0);
        const profitFactor = Math.abs(
            winningTrades.reduce((a, b) => a + b, 0) /
            (losingTrades.reduce((a, b) => a + b, 0) || 1)
        );

        let peak = this.initialBalance;
        let maxDrawdown = 0;
        let runningBalance = this.initialBalance;

        this.trades.forEach((trade) => {
            runningBalance += trade.profit;
            if (runningBalance > peak) {
                peak = runningBalance;
            }
            const drawdown = ((peak - runningBalance) / peak) * 100;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
            }
        });

        this.stats = {
            totalTrades: this.trades.length,
            winningTrades: winningTrades.length,
            losingTrades: losingTrades.length,
            profitFactor: profitFactor,
            totalProfit: totalProfit,
            finalBalance: this.balance,
            return: ((this.balance - this.initialBalance) / this.initialBalance) * 100,
            maxDrawdown: maxDrawdown,
            winRate: (winningTrades.length / this.trades.length) * 100,
        };
        return this.stats;
    }

    async runBacktest(startTime, endTime) {
        console.log("Iniciando backtest...");
        const candles = await this.getHistoricalData(startTime, endTime);
        console.log(`Dados obtidos: ${candles.length} candles`);

        const signals = this.analyzeCandles(candles);
        console.log("Análise técnica concluída", signals);

        signals.forEach((signal) => {
            const action = this.executeTrade(signal, signal.price);
            if (action) {
                console.log(`${signal.timestamp} - ${action} @ ${signal.price}`);
            }
        });

        const stats = this.calculateStatistics();
        console.log("\nResultados do Backtest:");
        console.log("------------------------");
        console.log(`Total de trades: ${stats.totalTrades}`);
        console.log(`Taxa de acerto: ${stats.winRate.toFixed(2)}%`);
        console.log(`Profit factor: ${stats.profitFactor.toFixed(2)}`);
        console.log(`Lucro total: $${stats.totalProfit.toFixed(2)}`);
        console.log(`Retorno: ${stats.return.toFixed(2)}%`);
        console.log(`Máximo drawdown: ${stats.maxDrawdown.toFixed(2)}%`);
        console.log(`Saldo final: $${stats.finalBalance.toFixed(2)}`);

        return { trades: this.trades, stats: stats };
    }
}

module.exports = Backtester;
