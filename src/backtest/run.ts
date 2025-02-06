const Backtester = require("./backtester");

async function runBacktest() {
    const backtester = new Backtester(100); // $10k inicial

    // Testar últimos 30 dias
    const endTime = new Date();
    const startTime = new Date();
    startTime.setDate(startTime.getDate() - 30);

    try {
        const results = await backtester.runBacktest(
            startTime.getTime(),
            endTime.getTime()
        );
        return results;
    } catch (error) {
        console.error("Erro no backtest:", error);
        throw error;
    }
}

// Executar se chamado diretamente
if (require.main === module) {
    runBacktest()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = runBacktest;
