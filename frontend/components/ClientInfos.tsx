import styles from 'styles/components/ClientInfos.module.css';
import { useContext } from 'react';
import { UserContext } from 'contexts/User.context';

export default function ClientSearch() {
    const { 
        email, 
        trades,
        createdAt, 
        licenses,
        totalYield, 
        initialBalance,
        additionalInfo 
    } = useContext(UserContext);
 
    return (
        <>{ email && 
        <div className = {styles.clientContainer}>
            <div className = {styles.infos}>
                <h1> Email: {email} </h1>
                <h5> Primeira sincronização: {createdAt} </h5>
                <h5> Banca inicial: R$ {initialBalance} </h5>
                <hr />
                <h2> Ganho com os bots: R$ {totalYield} </h2>
                
                <section className = {styles.botList}>
                    {licenses.map((license) => (
                        <button key = {license.botName} 
                            disabled = {license.remaining === "Sua licença expirou."}>
                            <h2> {license.botTitle} </h2>
                            <p> {license.remaining} </p>
                            <div>
                                <img src = {license.botImg} alt = "Bot icon" />
                            </div>
                        </button>
                    ))}
                </section>
            </div>
            <div>

                <h1> Últimas operações </h1>
                <section className = {styles.tradeList}>
                    {trades.map((trade) => (
                        <span className = {styles.trade} 
                            data-result = {trade.result}>
                            <p> {trade.date} </p>
                            <p> {trade.infos} </p>
                            <p> R$ {trade.amount} </p>
                            <p data-account = {trade.account}>
                                {trade.account} 
                            </p>
                            <p> {trade.botTitle} </p>
                        </span>
                    ))}
                    <span className = {styles.trade}>
                        <p> Horário </p>
                        <p> Informação </p>
                        <p> Valor </p>
                        <p> Conta </p>
                        <p> Bot </p>
                    </span>
                </section>
            </div>
        </div>}</>
    )
}