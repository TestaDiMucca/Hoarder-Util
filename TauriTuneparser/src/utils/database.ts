import idb from 'idb';

import { SongRecord } from 'src/types/types';

const DB_NAME = 'muzaquesDb';
const STORE_NAME = 'muzaques';

let db: idb.IDBPDatabase<SongRecord>;

const init = async () => {
  db = await idb.openDB(DB_NAME, 1, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
    },
  });
};

const list = async () => {
  const tx = db.transaction(STORE_NAME);
  const muzaqueStore = tx.objectStore(STORE_NAME);

  return await muzaqueStore.getAll();
};

const clear = async () => {
  const tx = db.transaction(STORE_NAME);
  const store = tx.objectStore(STORE_NAME);

  if (!store?.clear) return;

  // @ts-expect-error it thinks clear() is of never type
  await store.clear();
};

const addItem = async (item: SongRecord) => {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  await tx.objectStore(STORE_NAME).add(item);
};

const IndexedDB = {
  addItem,
  init,
  list,
  clear,
};

export default IndexedDB;
