import { Box, Button, useToast } from '@chakra-ui/react';
import { useCallback } from 'react';
import useLibraryContext from 'src/hooks/useLibraryContext';
import IndexedDB from 'src/utils/database';

export default function LibraryViewer() {
  const { setLibrary } = useLibraryContext();
  const toast = useToast();

  const handleUnload = useCallback(async () => {
    await IndexedDB.clear();

    toast({
      title: 'Library unloaded',
      description: 'Select another library to get started',
    });

    setLibrary([]);
  }, []);

  return (
    <Box>
      You are in the library
      <Button onClick={handleUnload}>Unload</Button>
    </Box>
  );
}
