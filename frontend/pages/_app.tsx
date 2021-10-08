import styles from'../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return <Component className = {styles.body} {...pageProps} />
}

export default MyApp
