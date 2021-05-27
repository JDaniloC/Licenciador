import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { GetServerSideProps } from 'next';
import Login from '../components/Login';
import { HeaderProvider } from '../contexts/Header.context';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title> Licenciador </title>
      </Head>

      <HeaderProvider>
        <Login/>
      </HeaderProvider>
    </div>
  )
}

export const getServerSideProps:GetServerSideProps = async (context) => {
  // const response = await axios.get(serverURL + "/api/missions/")
  return {
    props: {}  
  }
}