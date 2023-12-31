import { Box } from '@chakra-ui/react';

import './App.css';
import LibraryProvider from './providers/LibraryProvider';
import Container from './components/Container';
import UIStateProvider from './providers/UIStateProvider';

function App() {
  return (
    <Box w="full" h="full">
      <UIStateProvider>
        <LibraryProvider>
          <Container />
        </LibraryProvider>
      </UIStateProvider>
    </Box>
  );
}

export default App;
