import '../styles/globals.css'

function MyApp({ Component, pageProps, props="main" }) {
  return (
  <Component {...pageProps} />
  )
}

export default MyApp
