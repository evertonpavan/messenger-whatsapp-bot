import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { extendTheme } from '@chakra-ui/react'
import { QueryClientProvider } from 'react-query'
import { queryClient } from './services/ReactQuery/queryClient';
import { ReactQueryDevtools } from 'react-query/devtools'
import { CustomRoutes } from './routes';
import { AuthContext } from './contexts';

const theme = extendTheme({
  
})

function App() {

  return (
    <AuthContext>
      <QueryClientProvider client={queryClient}>
        <ChakraProvider theme={theme} resetCSS={true} cssVarsRoot="body">
          <CustomRoutes />
        </ChakraProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </AuthContext>
  )
}

export default App
