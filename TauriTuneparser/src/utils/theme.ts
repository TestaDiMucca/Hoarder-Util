import { extendTheme, ComponentStyleConfig } from '@chakra-ui/react';

const VStack: ComponentStyleConfig = {
  baseStyle: {
    alignItems: 'flex-start',
  },
};

const theme = extendTheme({
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'Georgia, serif',
    mono: 'Menlo, monospace',
  },
  components: {
    VStack,
  },
});

export default theme;
