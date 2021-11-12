import { useContext, useEffect, useState } from 'react';
import { HeaderContext } from 'contexts/Header.context';
import { RouterContext } from 'contexts/Router.context';

import Head from 'next/head'
import styles from 'styles/components/BotList.module.css';

interface Bot {
    _id: string,
    name: string,
    title: string,
    imageURL: string
}

export default function BotList({ bots }: { bots: Bot[] }) {
    const { setRoute } = useContext(RouterContext);
    const { 
        setCanBack, 
        setBotName, 
        setBotTitle 
    } = useContext(HeaderContext);

    const [available, setAvailable] = useState([]);
    const [showBots, setShowBots] = useState(false);

    useEffect(() => {
        const account = JSON.parse(localStorage.getItem("account"));
        if (account) {
            setShowBots(account.show);
            setAvailable(account.botList);
        }
    }, [])

    function selectBot(name: string, title: string) {
        setBotName(name); setBotTitle(title);
        setRoute("clients"); setCanBack(true);
    }

    function show(name:string): boolean {
        return available?.indexOf(name) !== -1;
    }

    return (<>
        <Head>
            <title> Licenciador | Bots </title>
        </Head>
        <section className = {styles.botList}>
            <h1> Escolha o bot para outorgar a licença </h1>
            {bots?.map((bot) => (
                <button key = {bot.name} 
                    onClick = {() => {selectBot(bot.name, bot.title)}} 
                    style = {{ display: (showBots || show(bot.name)) 
                        ? "initial" : "none" }}
                    disabled = {!show(bot.name)}>
                    <h2> {bot.title} </h2>
                    <div>
                        <img src = {bot.imageURL} alt = "Bot icon" />
                    </div>
                </button>
            ))}
        </section>
    </>)    
}
