const express = require('express');
const router = express.Router();
const DatabaseQueries = require('../database/queries');

// Rota para histórico paginado
router.get('/', async (req, res, next) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const page = parseInt(req.query.page) || 1;
        const offset = (page - 1) * limit;

        const [trades, stats] = await Promise.all([
            DatabaseQueries.getHistory(limit, offset),
            DatabaseQueries.getTradeStats()
        ]);

        res.json({
            page,
            limit,
            trades,
            stats
        });
    } catch (error) {
        next(error);
    }
});

// Rota para estatísticas
router.get('/stats', async (req, res, next) => {
    try {
        const stats = await DatabaseQueries.getTradeStats();
        res.json(stats);
    } catch (error) {
        next(error);
    }
});

// Rota para últimas operações
router.get('/latest', async (req, res, next) => {
    try {
        const trades = await DatabaseQueries.getHistory(10, 0);
        res.json(trades);
    } catch (error) {
        next(error);
    }
});

module.exports = router;