const express = require('express');
const config = require('./config/config');
const historyRoutes = require('./routes/historyRoutes');
const tradingService = require('./services/tradingService');
const binanceService = require('./services/binanceService');

const app = express();
app.use(express.json());

// Middleware para logs
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rotas
app.use('/history', historyRoutes);

// Rota de status atualizada com preço do BTC
app.get('/status', async (req, res) => {
    try {
        const klines = await binanceService.getKlines(config.trading.symbol, '1m', 1);
        const currentPrice = klines[0].close;

        res.json({
            status: 'running',
            timestamp: new Date().toISOString(),
            symbol: config.trading.symbol,
            price: {
                symbol: config.trading.symbol,
                value: currentPrice,
                formatted: `$${currentPrice.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                })}`
            }
        });
    } catch (error) {
        console.error('Erro ao obter preço:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro ao obter preço atual',
            error: error.message
        });
    }
});

// Handler de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Erro interno do servidor',
        message: err.message
    });
});

// Iniciar o servidor
app.listen(config.server.port, () => {
    console.log(`Servidor rodando em http://localhost:${config.server.port}`);
    console.log(`Trading bot iniciado para ${config.trading.symbol}`);
});

// Executar estratégia a cada 5 minutos
setInterval(async () => {
    try {
        const result = await tradingService.executeStrategy();
        if (result.action) {
            console.log(`Ação executada: ${result.action}`, result);
        }
    } catch (error) {
        console.error('Erro ao executar estratégia:', error);
    }
}, 5 * 60 * 1000);

// Iniciar estratégia imediatamente
tradingService.executeStrategy()
    .catch(error => console.error('Erro ao iniciar estratégia:', error));