import { useCallback, useEffect } from 'react';
import LoadLibrary from './LoadLibrary';
import IndexedDB from 'src/utils/database';
import useLibraryContext from 'src/hooks/useLibraryContext';
import LibraryViewer from './LibraryViewer';
import { Button, VStack } from '@chakra-ui/react';
import ConfigurationModal from './Configuration';
import useToggleState from 'src/hooks/useToggleState';

export default function Container() {
  const modalStates = useToggleState(['config']);
  const { library, setLibrary } = useLibraryContext();

  const loadData = useCallback(async () => {
    const loaded = await IndexedDB.list();

    setLibrary(loaded);
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  return (
    <VStack>
      {library.length ? <LibraryViewer /> : <LoadLibrary />}
      <Button onClick={modalStates.config.on}>Configuration</Button>
      <ConfigurationModal
        isOpen={modalStates.config.isOn}
        onClose={modalStates.config.off}
      />
    </VStack>
  );
}
