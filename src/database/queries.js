const db = require('./init');

class DatabaseQueries {
    static saveTrade(action, price, quantity, balance, rsi) {
        return new Promise((resolve, reject) => {
            const query = `
                INSERT INTO trades (action, price, quantity, balance, rsi)
                VALUES (?, ?, ?, ?, ?)
            `;
            
            db.run(query, [action, price, quantity, balance, rsi], function(err) {
                if (err) return reject(err);
                resolve(this.lastID);
            });
        });
    }

    static getHistory(limit = 100, offset = 0) {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT *
                FROM trades
                ORDER BY timestamp DESC
                LIMIT ? OFFSET ?
            `;
            
            db.all(query, [limit, offset], (err, rows) => {
                if (err) return reject(err);
                resolve(rows);
            });
        });
    }

    static getTradeStats() {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT 
                    COUNT(*) as total_trades,
                    SUM(CASE WHEN action LIKE 'OPEN%' THEN 1 ELSE 0 END) as total_entries,
                    SUM(CASE WHEN action LIKE 'CLOSE%' THEN 1 ELSE 0 END) as total_exits,
                    MIN(price) as min_price,
                    MAX(price) as max_price,
                    MIN(balance) as min_balance,
                    MAX(balance) as max_balance
                FROM trades
            `;
            
            db.get(query, [], (err, row) => {
                if (err) return reject(err);
                resolve(row);
            });
        });
    }

    static async getSetting(key) {
        return new Promise((resolve, reject) => {
            db.get(
                'SELECT value FROM settings WHERE key = ?',
                [key],
                (err, row) => {
                    if (err) return reject(err);
                    resolve(row ? row.value : null);
                }
            );
        });
    }

    static async saveSetting(key, value) {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO settings (key, value)
                 VALUES (?, ?)
                 ON CONFLICT(key) DO UPDATE SET 
                 value = excluded.value,
                 updated_at = CURRENT_TIMESTAMP`,
                [key, value],
                function(err) {
                    if (err) return reject(err);
                    resolve(this.changes);
                }
            );
        });
    }
}

module.exports = DatabaseQueries;
