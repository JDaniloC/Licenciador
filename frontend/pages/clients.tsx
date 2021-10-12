import ClientSearch from "components/ClientSearch";
import ClientInfos from "components/ClientInfos";
import { UserProvider } from "contexts/User.context";

import styles from 'styles/Clients.module.css';
import Head from 'next/head'

import 'bootstrap/dist/css/bootstrap.min.css';

export default function Clients() {  
    return (
        <div className={styles.container}>
            <Head>
                <title> Licenciador | Cliente </title>
            </Head>

            <UserProvider>
                <ClientSearch/>
                <ClientInfos/>
            </UserProvider>
        </div>
    )
}
