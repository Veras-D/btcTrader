const sqlite3 = require('sqlite3').verbose();
const config = require('../config/config');
const path = require('path');

const db = new sqlite3.Database(path.join(__dirname, '../../', config.database.path));

db.serialize(() => {
    // Tabela de trades
    db.run(`CREATE TABLE IF NOT EXISTS trades (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        action TEXT NOT NULL,
        price REAL NOT NULL,
        quantity REAL NOT NULL,
        balance REAL NOT NULL,
        rsi REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Tabela de configurações
    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Índices para melhor performance
    db.run('CREATE INDEX IF NOT EXISTS idx_trades_timestamp ON trades(timestamp)');
    db.run('CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key)');
});

// Função de cleanup para quando a aplicação for encerrada
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Erro ao fechar banco de dados:', err);
        } else {
            console.log('Conexão com banco de dados fechada');
        }
        process.exit(err ? 1 : 0);
    });
});

module.exports = db;
