import { GetServerSideProps } from 'next';
import { useEffect } from 'react';
import Head from 'next/head'
import axios from 'axios';

import 'bootstrap/dist/css/bootstrap.min.css';
import styles from '../styles/Home.module.css';

import { HeaderProvider } from '../contexts/Header.context';
import { RouterProvider } from '../contexts/Router.context';

import Header from '../components/Header';
import { serverURL } from '../config';

export default function Home({ bots }) {
  useEffect(() => {
    const attentionList = JSON.parse(localStorage.getItem("attention"));
    if (attentionList === null) {
      localStorage.setItem('attention', JSON.stringify({}));
    }
  }, [])
  
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