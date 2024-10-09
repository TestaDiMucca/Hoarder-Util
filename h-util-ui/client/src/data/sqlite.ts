/**
 * This is a workaround to turn off the warning for failing to install
 * OPFS sqlite3_vfs warning. We aren't using this sqlite-wasm option.
 */
(self as any).sqlite3ApiConfig = {
    warn: () => {},
};
import sqlite3InitModule, { Database, type Sqlite3Static } from '@sqlite.org/sqlite-wasm';
import { tablesSql } from './tables.sql';

const DEFAULT_DATABASE = '/hUtil-fe.sqlite3';

const log = console.log;
const error = console.error;
let database: Database | null = null;

const start = async (sqlite3: Sqlite3Static, _dbPath: string) => {
    log('Running SQLite3 version', sqlite3.version.libVersion);
    const db = new sqlite3.oo1.JsStorageDb('local');
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
    selectObj: <T>(sql: string, values?: any[]) => database!.selectObjects(sql, values) as T[],
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

export const initializeSQLite = async (dbPath: string = DEFAULT_DATABASE) => {
    try {
        const sqlite3 = await sqlite3InitModule({
            print: log,
            printErr: error,
        });
        await start(sqlite3, dbPath);
    } catch (err: any) {
        error('[sqlite] Initialization error:', err.name, err.message);
    }
};
