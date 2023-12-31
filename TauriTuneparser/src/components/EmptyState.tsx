import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  useToast,
  Text,
  Stack,
  StackDivider,
} from '@chakra-ui/react';
import { useCallback } from 'react';
import useLibraryContext from 'src/hooks/useLibraryContext';
import IndexedDB from 'src/utils/database';
import H1 from './common/H1';

export default function EmptyState() {
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
      <Card>
        <CardHeader>
          <H1>Muzaque Parser</H1>
        </CardHeader>
        <CardBody>
          <Stack divider={<StackDivider />} spacing="4">
            <Text>Select a graph from the upper menu to view stats.</Text>
            <Button variant="secondary" onClick={handleUnload}>
              Unload library
            </Button>
          </Stack>
        </CardBody>
      </Card>
    </Box>
  );
}
