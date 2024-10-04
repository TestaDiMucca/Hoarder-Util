import path from 'path';
import { app } from 'electron';
// import Sqlite3, { Database } from 'better-sqlite3';
import sqlite from 'sqlite3';
import { promises } from '@common/common';
import { tablesSql } from './tablesSql';

const DATA_FILE = 'hUtil.db';
const dbFilePath = path.join(app.getPath('userData'), DATA_FILE);

export const database = new sqlite.Database(dbFilePath);

export const queryDatabase = {
    run: (sql: string) =>
        new Promise<void>((resolve, reject) => database.run(sql, (err) => (err ? reject(err) : resolve()))),
};

export const initDbIfNeeded = () =>
    new Promise<void>((resolve) =>
        database.serialize(async () => {
            await promises.each(tablesSql, (tableSql) => queryDatabase.run(tableSql));
            resolve();
        }),
    );
