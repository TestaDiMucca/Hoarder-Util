import { Box } from '@chakra-ui/react';

import './App.css';
import LibraryProvider from './providers/LibraryProvider';
import Container from './components/Container';

function App() {
  return (
    <Box w="100vw" h="100vh">
      <LibraryProvider>
        <Container />
      </LibraryProvider>
    </Box>
  );
}

export default App;
