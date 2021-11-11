import { GetServerSideProps } from 'next';

import axios from 'axios';
import Head from 'next/head'

import Header from 'components/Header';
import styles from 'styles/Home.module.css';

import { serverURL } from 'config';
import { HeaderProvider } from 'contexts/Header.context';
import { RouterProvider } from 'contexts/Router.context';

import 'bootstrap/dist/css/bootstrap.min.css';

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

export interface botQuery {
  data: {
    _id: string,
    name: string,
    title: string,
    imageURL: string
  }[]
}

export const getServerSideProps:GetServerSideProps = async (context) => {
  const { data }:botQuery = await axios.get(
    serverURL + "/api/bots/").catch((err) => {
      console.error(err);
      return { data: [] }
    });
  
  return {
    props: {
        bots: data
    }  
  }
}