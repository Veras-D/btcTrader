const technicalIndicators = require('technicalindicators');

function calculateEMA(prices, period) {
    const input = {
        values: prices,
        period: period
    };
    return technicalIndicators.EMA.calculate(input);
}

module.exports = { calculateEMA };
