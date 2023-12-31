import { ChangeEvent, useCallback, useState } from 'react';
import {
  Text,
  VStack,
  useToast,
  Button,
  Box,
  Card,
  CardBody,
  Stack,
  StackDivider,
  HStack,
} from '@chakra-ui/react';

import { readFile } from 'src/utils/helpers';
import { callParser } from 'src/workers/parser.handler';
import useLibraryContext from 'src/hooks/useLibraryContext';
import { MediaRecord } from 'src/types/types';
import IndexedDB from 'src/utils/database';
import H2 from './common/H2';
import useUiState from 'src/hooks/useUiState';

function LoadLibrary() {
  const [loaded, setLoaded] = useState<MediaRecord[] | null>(null);

  const { library, setLibrary } = useLibraryContext();
  const { setLoading } = useUiState();

  const toast = useToast();
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;

        setLoading(true);
        const txt = await readFile(file);
        toast({
          title: 'Processing...',
          description: 'Now parsing, please hang on.',
        });
        const parsed = await callParser(txt);
        setLoaded(parsed);
      } catch (e: any) {
        console.error(e);
        toast({
          title: 'An error occurred',
          description: e.message ?? 'Unknown error',
          status: 'error',
        });
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const handleLoaded = useCallback(() => {
    setLibrary(library);
  }, [loaded]);

  const handlePersist = useCallback(async () => {
    if (!loaded || loaded.length === 0) return;

    try {
      setLoading(true);
      await IndexedDB.addItems(loaded);

      toast({
        title: 'Saved library',
        description: 'This library will now be the default on load',
      });

      handleLoaded();
    } catch (e: any) {
      console.error(e);
      toast({
        title: 'An error occurred',
        description: e.message ?? 'Unknown error',
        status: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [loaded, handleLoaded]);

  const handleCancel = useCallback(() => {
    setLibrary([]);
    setLoaded(null);
  }, []);

  return (
    <Card>
      <CardBody>
        <Stack divider={<StackDivider />}>
          <VStack gap="4">
            <H2>Select a library XML</H2>
            <input
              accept="xml"
              type="file"
              multiple={false}
              onInput={handleFileChange}
              disabled={loaded != null && loaded.length > 0}
            />
          </VStack>
          {loaded && (
            <Box>
              {loaded?.length === 0 && (
                <>Could not parse any results, try another file</>
              )}
              {loaded && loaded.length > 0 && (
                <>
                  <Text mb="4">
                    Parsed <strong>{loaded.length}</strong> rows
                  </Text>
                  <HStack justifyContent="space-around">
                    <Button onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleLoaded}>Confirm</Button>
                    <Button onClick={handlePersist}>Persist</Button>
                  </HStack>
                </>
              )}
            </Box>
          )}
        </Stack>
      </CardBody>
    </Card>
  );
}

export default LoadLibrary;
