import '../styles/globals.css'

import { AppProps } from 'next/app'
import { MoralisProvider } from '../providers/MoralisContext'

function App({ Component, pageProps }: AppProps) {
  return (
    <MoralisProvider>
      <Component {...pageProps} />
    </MoralisProvider>
  )
}

export default App
