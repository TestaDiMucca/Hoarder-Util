import * as idb from 'idb';

import { MediaRecord } from 'src/types/types';

const DB_NAME = 'muzaquesDb';
const STORE_NAME = 'muzaques';

let db: idb.IDBPDatabase<MediaRecord>;

const init = async () => {
  if (db) return;

  db = await idb.openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    },
  });
};

/** Makes sure db is opened if we didn't open it already */
const withInitDb = async <T>(cb: () => T): Promise<T> => {
  if (!db) await init();

  return cb();
};

const list = async () =>
  withInitDb(async () => {
    const tx = db.transaction(STORE_NAME);
    const muzaqueStore = tx.objectStore(STORE_NAME);

    return await muzaqueStore.getAll();
  });

const clear = async () =>
  withInitDb(async () => {
    const tx = db.transaction(STORE_NAME);
    const store = tx.objectStore(STORE_NAME);

    if (!store?.clear) return;

    // @ts-expect-error it thinks clear() is of never type
    await store.clear();
  });

const addItems = async (items: MediaRecord[]) =>
  withInitDb(async () => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    for (const item of items) {
      await tx.objectStore(STORE_NAME).add(item);
    }
  });

const IndexedDB = {
  addItems,
  init,
  list,
  clear,
};

export default IndexedDB;
