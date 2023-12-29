import { useCallback, useEffect } from 'react';
import LoadLibrary from './LoadLibrary';
import IndexedDB from 'src/utils/database';

export default function Container() {
  const loadData = useCallback(async () => {
    const loaded = await IndexedDB.list();

    console.log('init:load', loaded);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  return <LoadLibrary />;
}
