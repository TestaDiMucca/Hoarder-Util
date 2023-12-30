import { ChangeEvent, useCallback, useState } from 'react';
import { Text, VStack, useToast, Button } from '@chakra-ui/react';
import { readFile } from 'src/utils/helpers';
import { callParser } from 'src/workers/parser.handler';
import useLibraryContext from 'src/hooks/useLibraryContext';
import { MediaRecord } from 'src/types/types';
import IndexedDB from 'src/utils/database';

function LoadLibrary() {
  const [loaded, setLoaded] = useState<MediaRecord[] | null>(null);

  const { library, setLibrary } = useLibraryContext();

  const toast = useToast();
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;

        const txt = await readFile(file);
        const parsed = await callParser(txt);
        setLoaded(parsed);
      } catch (e: any) {
        console.error(e);
        toast({
          title: 'An error occurred',
          description: e.message ?? 'Unknown error',
          status: 'error',
        });
      }
    },
    []
  );

  const handleLoaded = useCallback(() => {
    setLibrary(library);
  }, [loaded]);

  const handlePersist = useCallback(async () => {
    if (!loaded || loaded.length === 0) return;

    console.log('persisting');
    await IndexedDB.addItems(loaded);

    toast({
      title: 'Saved library',
      description: 'This library will now be the default on load',
    });

    handleLoaded();
  }, [loaded]);

  const handleCancel = useCallback(() => {
    setLibrary([]);
    setLoaded(null);
  }, []);

  return (
    <VStack>
      <Text>Input here:</Text>
      <input
        accept="xml"
        type="file"
        multiple={false}
        onInput={handleFileChange}
        disabled={loaded != null && loaded.length > 0}
      />
      {loaded?.length === 0 && (
        <>Could not parse any results, try another file</>
      )}
      {loaded && loaded.length > 0 && (
        <>
          <Text>Parsed {loaded.length} rows</Text>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleLoaded}>Confirm</Button>
          <Button onClick={handlePersist}>Persist</Button>
        </>
      )}
    </VStack>
  );
}

export default LoadLibrary;
