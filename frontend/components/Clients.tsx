import styles from '../styles/components/Clients.module.css';
import { HeaderContext } from '../contexts/Header.context';

import { useContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Table from 'react-bootstrap/Table';
import Head from 'next/head'
import axios from 'axios';

export interface Client {
    email: string;
    license: number;
    updateAt: string;
}

export default function Clients() {
    const { botName, setTests, setLicenses } = useContext(HeaderContext);

    const [email, setEmail] = useState("");
    const [newEmail, setNewEmail] = useState("");
    const [licenses, setClientLicenses] = useState(0);
    const [clients, setClients] = useState<Client[]>([]);
    
    async function loadClients() {
        const account = JSON.parse(localStorage.getItem('account'));
        const { data }: { data: Client[] } = await axios.get(
            "/api/clients/", { params: {
                email: account.email, botName, isSeller: true
            }
        });
        setClients(data);
    }

    useEffect(() => {
        loadClients();
    }, [])

    function selectClient({ target }) {
        const value = target.value;
        let days = 0;
        clients.map(client => {
            if (client.email === value) days = client.license;
        })
        
        setEmail(value);
        setClientLicenses(days);
    }

    async function giveLicense(evt) {
        if (!email) {
            return;
        }
    
        const isTest = evt.target.id === "test";
        const account = JSON.parse(localStorage.getItem('account')); 
        const newAccount = JSON.parse(localStorage.getItem('account'))
        const { data } = await axios.post("/api/licenses/", {
            sellerEmail: account.email, clientEmail: email, isTest, botName
        })
       
        newAccount['licenses'] = data.licenses;
        newAccount['tests'] = data.tests;

        const newClients = clients.map(client => {
            if (client.email === email) {
                client.license = data.time;
                client.updateAt = data.updateTime;
            }
            return client;
        })
        localStorage.setItem("account", JSON.stringify(newAccount))
        
        setClients(newClients);
        setClientLicenses(data.time);
        if (isTest) {
            setTests(data.tests)
        } else {
            setLicenses(data.licenses);
        }
    }

    async function createClient() {
        const account = JSON.parse(localStorage.getItem('account'));
        const { data } = await axios.post("/api/clients/", {
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
        await axios.delete("/api/clients/", {
            params: {
                seller: account.email, email
            }
        }).then(() => {
            setEmail("");
            loadClients();
            setClientLicenses(0);
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
                    <h2> Cadastrar novo cliente </h2>
                    <form>
                        <input type="email" placeholder="E-mail" required
                            value = {newEmail} onChange = {({ target }) => {
                                setNewEmail(target.value);
                            }}/>
                        <Button variant = "primary" 
                            onClick = {createClient}> 
                            Adicionar novo cliente 
                        </Button>
                    </form>
                </div>
            </section>
            <section className = {styles.clientSettings}>
                <h2> Dados do cliente </h2>
                <form>
                    <input value = {email} placeholder = "E-mail" disabled/>
                    <input type="number" value = {licenses}
                        placeholder = "Dias da licença" disabled/>
                    <div style = {{ margin: "5px 0" }}>
                        <Button variant = "outline-primary" id = "test"
                            onClick = {giveLicense}> 
                            Teste grátis 
                        </Button>
                        <Button variant = "outline-primary" 
                            onClick = {giveLicense}>
                            Renovar licença 
                        </Button>
                    </div>
                    <Button variant = "danger" onClick = {deleteClient}>
                        Deletar usuário 
                    </Button>
                </form>
            </section>
        </section>
        <section className = {styles.clientList}>
            <Table hover>
                <thead>
                    <tr>
                        <th> E-mail </th>
                        <th> Dias </th>
                        <th> Desde </th>
                    </tr>
                </thead>
                <tbody>
                    {clients.map((client) => (
                        <tr key = {client.email}>
                            <td> {client.email} </td>
                            <td> {client.license} </td>
                            <td> {client.updateAt} </td>
                            <Button variant = "outline-primary"
                                value = {client.email}
                                onClick = {selectClient}>
                                Visualizar
                            </Button>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </section>
    </>)    
}
