const Binance = require('node-binance-api');
const config = require('../config/config');

const binance = new Binance().options({
    APIKEY: config.binance.apiKey,
    APISECRET: config.binance.apiSecret,
    useServerTime: true,
    recvWindow: 60000
});

module.exports = {
    getKlines: async (symbol, interval, limit) => {
        try {
            const klines = await binance.futuresCandles(symbol, interval, { limit });
            return klines.map(k => ({
                timestamp: k[0],
                open: parseFloat(k[1]),
                high: parseFloat(k[2]),
                low: parseFloat(k[3]),
                close: parseFloat(k[4]),
                volume: parseFloat(k[5])
            }));
        } catch (error) {
            console.error('Erro ao obter klines:', error);
            throw error;
        }
    },

    createOrder: async (symbol, side, quantity, type = 'MARKET') => {
        try {
            const order = await binance.futuresOrder(side, symbol, quantity, null, {
                type: type
            });
            return order;
        } catch (error) {
            console.error('Erro ao criar ordem:', error);
            throw error;
        }
    }
};
