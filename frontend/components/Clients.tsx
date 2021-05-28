import styles from '../styles/components/Clients.module.css';
import { HeaderContext } from '../contexts/Header.context';
import { useContext, useEffect, useState } from 'react';
import Head from 'next/head'
import axios from 'axios';
import { serverURL } from '../config';

export default function Clients() {
    const { botName, setTests, setLicenses } = useContext(HeaderContext);

    const [clients, setClients] = useState({});
    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [licenses, setClientLicenses] = useState("");
    const [currentClient, setCurrentClient] = useState("");

    async function loadClients() {
        const account = JSON.parse(localStorage.getItem('account'));
        const { data } = await axios.get(serverURL + "/api/clients/", {
            params: {
                email: account.email, botName
            }
        });
        const tempClients = {};

        Object.keys(data).forEach(email => {
            tempClients[email] = data[email];
        });

        setClients(tempClients);
    }

    useEffect(() => {
        loadClients();
    }, [])

    function selectClient(value) {
        setCurrentClient(value); 
        if (value !== "") {
            const days = clients[value].licenses[botName];
            setEmail(value)
            setClientLicenses(days);
        } else {
            setEmail("");
            setClientLicenses("");
        }
    }

    async function giveLicense(isTest:boolean = false) {
        if (!email) {
            return;
        }
    
        const account = JSON.parse(localStorage.getItem('account')); 
        const { data } = await axios.post(serverURL + "/api/licenses/", {
            sellerEmail: account.email, clientEmail: email, isTest, botName
        })
       
        const newAccount = JSON.parse(localStorage.getItem('account'))
        newAccount['licenses'] = data.licenses
        newAccount['tests'] = data.tests
        clients[email].licenses[botName] = data.time;
        localStorage.setItem("account", JSON.stringify(newAccount))
        
        setClientLicenses(data.time);
        if (isTest) {
            setTests(data.tests)
        } else {
            setLicenses(data.licenses);
        }
    }

    async function createClient() {
        const account = JSON.parse(localStorage.getItem('account'));
        const { data } = await axios.post(serverURL + "/api/clients/", {
            sellerEmail: account.email, clientEmail: newEmail, botName
        })
        clients[newEmail] = data;
        setNewEmail("");
    }
    
    async function deleteClient() {
        const account = JSON.parse(localStorage.getItem('account'));

        if (!email) {
            return false;
        }
        await axios.delete(serverURL + "/clients/", {
            params: {
                seller: account.email, email
            }
        }).then(() => {
            setEmail("");
            loadClients();
            setClientLicenses("");
        })
    }

    return (<>
        <Head>
            <title> Licenciador | Clients </title>
        </Head>
        <h2 className = {styles.botName}>
            { botName.toUpperCase() }
        </h2>
        <section className="dashboard">
            <section className = {styles.clients}>
                <div>
                    <h2> Clientes cadastrados </h2>
                    <select name="clients" value = {currentClient}
                        onChange = {(evt) => { 
                            selectClient(evt.target.value); 
                        }}>
                        <option value=""> 
                            Selecionar 
                        </option>
                        {Object.keys(clients).map((client) => (
                            <option value={client} key = {client}>
                                {client}
                            </option>
                        ))}
                    </select>
                </div>
                <div> 
                    <h2> Cadastrar novo cliente </h2>
                    <form>
                        <input type="email" placeholder="E-mail" required
                            value = {newEmail} onChange = {({ target }) => {
                                setNewEmail(target.value);
                            }}/>
                        <button type = "button" onClick = {() => {createClient()}}> 
                            Adicionar novo cliente 
                        </button>
                    </form>
                </div>
            </section>
            <section className = {styles.clientSettings}>
                <h2> Dados do cliente </h2>
                <form>
                    <input value = {email} placeholder = "E-mail" disabled/>
                    <input type="number" value = {licenses}
                        placeholder = "Dias da licença" disabled/>
                    <div>
                        <button onClick = {() => {giveLicense(true)}} 
                            type = "button"> 
                            Teste grátis 
                        </button>
                        <button onClick = {() => {giveLicense()}} 
                            type = "button">  
                            Renovar licença 
                        </button>
                    </div>
                    <button onClick = {() => {deleteClient()}} type = "button"> 
                        Deletar usuário 
                    </button>
                </form>
            </section>
        </section>
    </>)    
}
