import styles from '../styles/components/Clients.module.css';
import { HeaderContext } from '../contexts/Header.context';
import React, { useContext, useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';

import Button from 'react-bootstrap/Button';
import ReactPaginate from 'react-paginate';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Head from 'next/head'
import axios from 'axios';

const PER_PAGE = 5;
export interface Client {
    email: string;
    license: number;
    updateAt: string;
}

export default function Clients() {
    const { botName, setLicenses } = useContext(HeaderContext);

    const [licenseDays, setLicenseDays] = useState(1);
    const [email, setEmail] = useState<string>("");

    const [clientLicenses, setClientLicenses] = useState<number>(0);
    const [newEmail, setNewEmail] = useState<string>("");
    const [clients, setClients] = useState<Client[]>([]);

    const [pageCount, setPageCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortCriteria, setSortCriteria] = useState<string>("email");
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);

    async function loadClients() {
        const account = JSON.parse(localStorage.getItem('account'));
        const { data }: { data: Client[] } = await axios.get(
            "/api/clients/", { params: {
                email: account.email, botName, isSeller: true
            }
        });
        setClients(data);
        setFilteredClients(data);
        setPageCount(Math.ceil(data.length / PER_PAGE));
    }

    useEffect(() => {
        loadClients();
    }, [])
    useEffect(() => {
        if (searchTerm === "") {
            setPageCount(Math.floor(clients.length / PER_PAGE));
            return setFilteredClients(clients);
        }
        const filtered = clients.filter((client) => (
            client.email.toLowerCase().indexOf(
                searchTerm.toLowerCase()) !== -1))
        setFilteredClients(filtered);
        setPageCount(Math.floor(filtered.length / PER_PAGE));
    }, [searchTerm, clients])

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
    
        const account = JSON.parse(localStorage.getItem('account')); 
        const newAccount = JSON.parse(localStorage.getItem('account'))
        const { data } = await axios.post("/api/licenses/", {
            sellerEmail: account.email, clientEmail: email, licenseDays, botName
        })
       
        newAccount['licenses'] = data.licenses;
        let foundClient = false;

        const newClients = clients.map(client => {
            if (client.email === email) {
                client.license = data.time;
                client.updateAt = data.updateTime;
                foundClient = true;
            }
            return client;
        })
        localStorage.setItem("account", JSON.stringify(newAccount))
        
        setClients(newClients);
        setLicenses(data.licenses);
        setClientLicenses(data.time);
    }

    async function createClient() {
        const account = JSON.parse(localStorage.getItem('account'));
        const { data } = await axios.post("/api/clients/", {
            sellerEmail: account.email, clientEmail: newEmail, botName
        })
        setNewEmail("");
        setClients(prevState => [...prevState, {
            email: newEmail, license: 0, updateAt: data.since
        }]);
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

    function changeLicenseDays(evt) {
        const value = evt.target.value;
        setLicenseDays(value);
    }
    
    function searchUpdated(evt) {
        setCurrentPage(0);
        setSearchTerm(evt.target.value);
    }
    function handleChangeCriteria(evt) {
        const criteria = evt.target.getAttribute('data-criteria');
        setSortCriteria(criteria);
    }
    function handlePaginate(evt) {
        setCurrentPage(evt.selected);
    }

    function orderTable() {
        const start = currentPage * PER_PAGE;
        const end = start + PER_PAGE;
        if (sortCriteria === "email") {
            return filteredClients.sort((a, b) => (
                a.email.localeCompare(b.email)
            )).slice(start, end);
        } else if (sortCriteria === "license") {
            return filteredClients.sort((a, b) => (
                b.license - a.license
            )).slice(start, end);
        } else {
            return filteredClients.sort((a, b) => (
                a.updateAt.localeCompare(b.updateAt)
            )).slice(start, end);
        }
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
                    <input type="number" value = {clientLicenses}
                        placeholder = "Dias da licença" disabled/>
                    <div style = {{ margin: "1em 0 0" }}>
                        <FloatingLabel className="mb-3"
                                label="Dias de licença"
                            >
                            <Form.Control min = {1}
                                value = {licenseDays} type="number" 
                                onChange = {changeLicenseDays}/>
                        </FloatingLabel>
                        <Button variant = "outline-primary" 
                            style = {{ height: "fit-content" }}
                            onClick = {giveLicense}>
                            Conceder licença
                        </Button>
                    </div>
                    <Button variant = "danger" onClick = {deleteClient}>
                        Deletar usuário 
                    </Button>
                </form>
            </section>
        </section>
        <input 
            type = "text" 
            value = {searchTerm} 
            onChange={searchUpdated}
            className = {styles.search}
            placeholder = {"Buscar cliente..."}
        />
        
        <section className = {styles.clientList}>
            <Table hover>
                <thead>
                    <tr>
                        <th data-criteria = "email"
                            onClick = {handleChangeCriteria}> 
                            E-mail 
                        </th>
                        <th data-criteria = "license"
                            onClick = {handleChangeCriteria}> 
                            Dias 
                        </th>
                        <th data-criteria = "updateAt"
                            onClick = {handleChangeCriteria}> 
                            Desde 
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {orderTable().map((client) => (
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
            <ReactPaginate
                previousLabel={'Anterior'}
                nextLabel={'Próximo'}
                breakLabel={'...'}
                marginPagesDisplayed={1}
                pageRangeDisplayed={1}
                pageCount={pageCount}
                onPageChange={handlePaginate}
                containerClassName={"pagination"}
                previousLinkClassName={"pagination__link"}
                nextLinkClassName={"pagination__link"}
                disabledClassName={"pagination__link--disabled"}
                activeClassName={"pagination__link--active"}
            />
        </section>
    </>)    
}
