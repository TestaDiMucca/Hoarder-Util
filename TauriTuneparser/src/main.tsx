import React from 'react'
import ReactDOM from 'react-dom/client'
import { ChakraProvider, ColorModeProvider} from '@chakra-ui/react'

import App from './App.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ChakraProvider>
      <ColorModeProvider>
      <App />
      </ColorModeProvider>
    </ChakraProvider>
    
  </React.StrictMode>,
)
