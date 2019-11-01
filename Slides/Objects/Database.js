const sqlite = require('sqlite3').verbose();
const { SQLITE_DB } = require('../constants');
const Tools = require('./Tools');

/**
 * Singleton class
 */
class Database {
    constructor () {
        this.initiated = false;
        this.db = new sqlite.Database(SQLITE_DB);
        this.init();
    }

    init () {
        if (this.initiated) return;
        this.initiated = true;
        this.db.serialize(() => {
            this.db.run('CREATE TABLE if not exists trips (id INTEGER PRIMARY KEY, title TEXT)');
            this.db.run('CREATE TABLE if not exists trip_days (id INTEGER PRIMARY KEY, trip_id INTEGER, description TEXT, date TEXT)');
        });
    }

    handleError (sql, err, reject) {
        console.log(`[Database] sql error on statement ${sql}:`, err);
        reject(err);
    } 

    run (sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) return this.handleError(sql, err, reject);
                const lastID = this.lastID;
                resolve(lastID);
            });
        });
    }

    get (sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) return this.handleError(sql, err, reject);
                resolve(Tools.processRow(row));
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) return this.handleError(sql, err, reject);
                resolve(rows.map(row => Tools.processRow(row)));
            });
        });
    }
}

module.exports = new Database();
