const technicalIndicators = require('technicalindicators');

function calculateRSI(prices, period = 14) {
    const input = {
        values: prices,
        period: period
    };
    return technicalIndicators.RSI.calculate(input);
}

module.exports = { calculateRSI };
