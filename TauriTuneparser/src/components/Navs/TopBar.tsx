import { Box, BoxProps } from '@chakra-ui/react';
import { colors } from 'src/utils/palettes';

type Props = BoxProps;

export default function TopBar({ children }: Props) {
  return (
    <Box
      w="full"
      position="absolute"
      top="0"
      left="0"
      right="0"
      h="10"
      p="2"
      boxSizing="border-box"
      display="flex"
      height="fit-content"
      borderBottom={`1px solid ${colors.blue}`}
      background={colors.lightBlue}
      filter={`drop-shadow(0px 1px 8px ${colors.gray})`}
    >
      {children}
    </Box>
  );
}
