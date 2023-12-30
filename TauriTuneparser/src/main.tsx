import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, ColorModeProvider } from '@chakra-ui/react';

import App from './App.tsx';
import './index.css';
import theme from './utils/theme.ts';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <ColorModeProvider>
        <App />
      </ColorModeProvider>
    </ChakraProvider>
  </React.StrictMode>
);
