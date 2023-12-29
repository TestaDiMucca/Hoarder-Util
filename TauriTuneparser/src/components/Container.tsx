import { useCallback, useEffect } from 'react';
import LoadLibrary from './LoadLibrary';
import IndexedDB from 'src/utils/database';
import useLibraryContext from 'src/hooks/useLibraryContext';
import LibraryViewer from './LibraryViewer';

export default function Container() {
  const { library, setLibrary } = useLibraryContext();

  const loadData = useCallback(async () => {
    const loaded = await IndexedDB.list();

    setLibrary(loaded);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  return library.length ? <LibraryViewer /> : <LoadLibrary />;
}
