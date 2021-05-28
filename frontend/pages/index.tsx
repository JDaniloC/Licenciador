import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { HeaderProvider } from '../contexts/Header.context';
import { RouterProvider } from '../contexts/Router.context';
import Header from '../components/Header';
import { GetServerSideProps } from 'next';
import { serverURL } from '../config';
import axios from 'axios';

export default function Home({ bots }) {
  return (
    <div className={styles.container}>
      <Head>
        <title> Licenciador </title>
      </Head>

      <HeaderProvider>
        <RouterProvider bots = {bots}>
          <Header/> 
        </RouterProvider>
      </HeaderProvider>
    </div>
  )
}

export const getServerSideProps:GetServerSideProps = async (context) => {
  const response = await axios.get(serverURL + "/bots/");

  return {
    props: {
        bots: response.data
    }  
  }
}