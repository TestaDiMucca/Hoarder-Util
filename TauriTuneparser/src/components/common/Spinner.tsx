import { Box, Spinner as DefaultSpinner } from '@chakra-ui/react';

import { colors } from 'src/utils/palettes';

export default function Spinner() {
  return (
    <Box w="full" p="2">
      <DefaultSpinner
        thickness="4px"
        speed="0.65s"
        emptyColor="gray.200"
        color={colors.blue}
        size="xl"
      />
    </Box>
  );
}
