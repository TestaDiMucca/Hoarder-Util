import sqlite3InitModule, { Database, type Sqlite3Static } from '@sqlite.org/sqlite-wasm';
import { tablesSql } from './tablesSql';

const log = console.log;
const error = console.error;
let database: Database | null = null;

const start = async (sqlite3: Sqlite3Static) => {
    log('Running SQLite3 version', sqlite3.version.libVersion);
    const db = new sqlite3.oo1.DB('/hUtil.sqlite3', 'ct');
    database = db;
    // Your SQLite code here.
    await initDbIfNeeded();
};

export const queryDatabase = {
    run: <T>(sql: string, values?: any[]) =>
        new Promise<T[]>((resolve, reject) =>
            database
                ? database.exec({
                      sql,
                      bind: values,
                      /** This calls once per row */
                      callback: (data) => resolve(data as T[]),
                  })
                : reject(new Error('No database')),
        ),
};

const initDbIfNeeded = async () => {
    for (let i = 0; i < tablesSql.length; i++) {
        const sql = tablesSql[i];
        try {
            queryDatabase.run<void>(sql);
        } catch (e) {
            console.error('ERROR', e, sql);
        }
    }

    setTimeout(async () => {
        const tables = await queryDatabase.run<string>(`
          SELECT name FROM sqlite_schema 
WHERE type IN ('table','view') 
AND name NOT LIKE 'sqlite_%'
ORDER BY 1;
          `);

        console.log('tables,', tables);

        const db = database?.selectValues(`
          SELECT name FROM sqlite_schema 
WHERE type IN ('table','view') 
AND name NOT LIKE 'sqlite_%'
ORDER BY 1;
          `);

        console.log('db', db);
    }, 1000);
};

export const initializeSQLite = async () => {
    try {
        log('Loading and initializing SQLite3 module...');
        const sqlite3 = await sqlite3InitModule({
            print: log,
            printErr: error,
        });
        log('Done initializing. Running demo...');
        await start(sqlite3);
    } catch (err: any) {
        error('Initialization error:', err.name, err.message);
    }
};
