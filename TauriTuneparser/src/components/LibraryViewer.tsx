import { Box, Button } from '@chakra-ui/react';
import { useCallback } from 'react';
import useLibraryContext from 'src/hooks/useLibraryContext';
import IndexedDB from 'src/utils/database';

export default function LibraryViewer() {
  const { setLibrary } = useLibraryContext();
  const handleUnload = useCallback(async () => {
    IndexedDB.clear();
    setLibrary([]);
  }, []);

  return (
    <Box>
      You are in the library
      <Button onClick={handleUnload}>Unload</Button>
    </Box>
  );
}
