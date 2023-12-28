import { Text, VStack, useToast } from '@chakra-ui/react';
import { ChangeEvent, useCallback } from 'react';
import { readFile } from 'src/utils/helpers';
import { parseXml } from 'src/utils/parser';

function LoadLibrary() {
  const toast = useToast();
  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      try {
        const file = e.target.files?.[0];
        if (!file) return;

        const txt = await readFile(file);
        const parsed = await parseXml(txt);
        console.log(parsed);
      } catch (e: any) {
        toast({
          title: 'An error occurred',
          description: e.message ?? 'Unknown error',
          status: 'error',
        });
      }
    },
    []
  );

  return (
    <VStack>
      <Text>Input here:</Text>
      <input
        accept="xml"
        type="file"
        multiple={false}
        onInput={handleFileChange}
      />
    </VStack>
  );
}

export default LoadLibrary;
