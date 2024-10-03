import path from 'path';
import { app } from 'electron';
import sqlite3 from 'sqlite3';

const DATA_FILE = 'hUtil.db';
const dbFilePath = path.join(app.getPath('userData'), DATA_FILE);

export const sqlite = new sqlite3.Database(dbFilePath, (err) => {
    if (err) console.error('[sqlite] Database open error: ', err);
    else console.debug(`[sqlite] Opened database (${dbFilePath})`);
});
