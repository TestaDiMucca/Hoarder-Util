import { extendTheme, ComponentStyleConfig } from '@chakra-ui/react';

const VStack: ComponentStyleConfig = {
  baseStyle: {
    alignItems: 'flex-start',
  },
};

const theme = extendTheme({
  components: {
    VStack,
  },
});

export default theme;
