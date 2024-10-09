import sqlite3InitModule, { Database, type Sqlite3Static } from '@sqlite.org/sqlite-wasm';
import { tablesSql } from './tablesSql';

const log = console.log;
const error = console.error;
let database: Database | null = null;

const sqliteFlags = {
    c: true,
    t: false,
};

const start = async (sqlite3: Sqlite3Static) => {
    log('Running SQLite3 version', sqlite3.version.libVersion);
    const db = new sqlite3.oo1.DB(
        '/hUtil.sqlite3',
        Object.entries(sqliteFlags).reduce<string>((a, [flag, enabled]) => {
            if (enabled) a += flag;
            return a;
        }, ''),
    );
    database = db;
    await initDbIfNeeded();
};

const noDatabaseError = () => {
    throw new Error('No database');
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
    select: <T>(sql: string, values?: any[]) =>
        database ? (database.selectValues(sql, values) as T[]) : noDatabaseError(),
};

const initDbIfNeeded = async () => {
    try {
        for (let i = 0; i < tablesSql.length; i++) {
            const sql = tablesSql[i];
            queryDatabase.run<void>(sql);
        }
    } catch (e) {
        console.error(`[sqlite] Error initializing db`, e);
    }
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
