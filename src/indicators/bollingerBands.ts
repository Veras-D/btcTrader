/**
 * Calculates Bollinger Bands.
 * @param {number[]} closes - Array of closing prices.
 * @param {number} period - Period for Bollinger Bands (default: 20).
 * @param {number} stdDev - Standard deviation multiplier (default: 2.5).
 * @returns {Object[]} - Array of objects with upper, middle, and lower bands.
 */

function calculateBollingerBands(closes, period = 20, stdDev = 2.5) {
    if (closes.length < period) {
        throw new Error("Not enough data to calculate Bollinger Bands.");
    }

    return closes
        .map((_, i) => {
            if (i < period - 1) return null;

            const slice = closes.slice(i - period + 1, i + 1);
            const mean = slice.reduce((sum, val) => sum + val, 0) / period;
            const variance =
                slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
                period;
            const stdDeviation = Math.sqrt(variance);

            return {
                upper: mean + stdDev * stdDeviation,
                middle: mean,
                lower: mean - stdDev * stdDeviation,
            };
        })
        .filter((x) => x !== null);
}

module.exports = { calculateBollingerBands };
