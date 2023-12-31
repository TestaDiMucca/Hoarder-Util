import { useCallback, useEffect } from 'react';
import LoadLibrary from './LoadLibrary';
import IndexedDB from 'src/utils/database';
import useLibraryContext from 'src/hooks/useLibraryContext';
import LibraryViewer from './LibraryViewer';
import { Box, VStack } from '@chakra-ui/react';
import BottomBar from './Navs/BottomBar';
import Loader from './common/Loader';

export default function Container() {
  const { library, setLibrary, renderKey } = useLibraryContext();

  const loadData = useCallback(async () => {
    const loaded = await IndexedDB.list();

    setLibrary(loaded);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <VStack w="3xl" h="full">
      <Box h="full" key={renderKey}>
        {library.length ? <LibraryViewer /> : <LoadLibrary />}
      </Box>

      <BottomBar />
      <Loader />
    </VStack>
  );
}
