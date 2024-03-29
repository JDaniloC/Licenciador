import React, { ChangeEvent, useContext, useEffect, useState } from 'react';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import { HeaderContext } from 'contexts/Header.context';
import { RouterContext} from 'contexts/Router.context';

import Button from 'react-bootstrap/Button';
import ReactPaginate from 'react-paginate';
import Table from 'react-bootstrap/Table';
import Form from 'react-bootstrap/Form';
import Head from 'next/head'
import axios from 'services/api';
import styles from 'styles/components/Clients.module.css';

const PER_PAGE = 5;
export interface Client {
    botName: string;
    seller: string;
    email: string;
    license: number;
    updateAt: string;
}

export default function Clients() {
    const { botName, setBotName, setLicenses } = useContext(HeaderContext);
    const { setIsAuthenticated } = useContext(RouterContext);

    const [sellerEmail, setSellerEmail] = useState(false);
    const [licenseDays, setLicenseDays] = useState(1);
    const [email, setEmail] = useState<string>("");
    const [isAdmin, setIsAdmin] = useState(false);

    const [clientLicenses, setClientLicenses] = useState<number>(0);
    const [newEmail, setNewEmail] = useState<string>("");
    const [clients, setClients] = useState<Client[]>([]);

    const [pageCount, setPageCount] = useState<number>(0);
    const [currentPage, setCurrentPage] = useState<number>(0);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [sortCriteria, setSortCriteria] = useState<string>("email");
    const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);

    async function loadClients() {
        const account = JSON.parse(localStorage.getItem('account'));
        if (account.type === "admin") {
            setIsAdmin(true);
        }
        setSellerEmail(account.email);
        axios.get("/api/clients/", { params: {
            email: account.email, botName,
        }}).then(({ data }: { data: Client[] }) => {
            setClients(data);
            setFilteredClients(data);
            setPageCount(Math.ceil(data.length / PER_PAGE));
        }).catch((error) => {
            if (error.response.status === 401) setIsAuthenticated(false);
        });
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
        const { email, seller, bot } = target.dataset;
        for (let index = 0; index < clients.length; index++) {
            const client = clients[index];
            if (client.email == email && client.botName == bot) {
                setClientLicenses(client.license);
                break;
            } 
        }
        setSellerEmail(seller);
        setBotName(bot);
        setEmail(email);
    }

    async function giveLicense() {
        if (!email && selectedEmails.length === 0) {
            return;
        }
    
        const newAccount = JSON.parse(localStorage.getItem('account'));
        const emailList = selectedEmails.length > 0 ? selectedEmails : [email];
        emailList.forEach((email) => {
            axios.post("/api/licenses/", {
                sellerEmail, botName,
                clientEmail: email, licenseDays, 
            }).then(({ data }) => {
                newAccount['licenses'] = data.licenses;
                newAccount['tests'] = data.tests;
        
                const newClients = clients.map(client => {
                    if (client.botName === data.botName && 
                        client.email === data.email) {
                        client.license = data.license;
                        client.updateAt = data.updateAt;
                    }
                    return client;
                })
                if (!isAdmin) {
                    localStorage.setItem("account",
                        JSON.stringify(newAccount))
                }
                
                setClients(newClients);
                setLicenses(data.licenses);
                setClientLicenses(data.license);
            }).catch((error) => {
                if (error.response.status === 401) setIsAuthenticated(false);
            });
        })
    }

    async function createClient() {
        if (isAdmin) {
            return alert("Crie uma conta de vendedor.");
        }
        axios.post("/api/clients/", {
            sellerEmail, botName,
            clientEmail: newEmail
        }).then(({ data }) => {
            setNewEmail("");
            setClients(prevState => [...prevState, data]);
        }).catch((error) => {
            if (error.response.status === 401) setIsAuthenticated(false);
        });
    }
    
    async function deleteClient() {
        if (!email && selectedEmails.length === 0) {
            return false;
        }
        const emailList = selectedEmails.length > 0 ? selectedEmails : [email];
        emailList.forEach(async (email) => {
            await axios.delete("/api/clients/", { params: {
                seller: sellerEmail, email, botName
            }}).then(() => {
                setEmail("");
                loadClients();
                setClientLicenses(0);
            }).catch((error) => {
                if (error.response.status === 401) setIsAuthenticated(false);
            });
        });
        setSelectedEmails([]);
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
                b.license > a.license ? 1 : -1
            )).slice(start, end);
        } else if (sortCriteria === "botName") {
            return filteredClients.sort((a, b) => (
                b.botName > a.botName ? 1 : -1
            )).slice(start, end);
        } else if (sortCriteria === "seller") {
            return filteredClients.sort((a, b) => (
                b.seller > a.seller ? 1 : -1
            )).slice(start, end);
        } else {
            return filteredClients.sort((a, b) => (
                a.updateAt.localeCompare(b.updateAt)
            )).slice(start, end);
        }
    }

    function selectEmail(event: ChangeEvent<HTMLInputElement>) {
        const email = event.target.value;
        const newSelected = [...selectedEmails];
        if (newSelected.includes(email)) {
            newSelected.splice(newSelected.indexOf(email), 1);
        } else {
            newSelected.push(email);
        }
        setSelectedEmails(newSelected);
    }

    function isSelected(email: string) {
        return selectedEmails.includes(email);
    }

    function cleanSelection() {
        setSelectedEmails([]);
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
                { !isAdmin && selectedEmails.length > 0 && (
                    <div>
                        <h2> Clientes selecionados </h2>
                        <ul>
                            {selectedEmails.map(email => (
                                <li key={email}> {email} </li>
                            ))}
                        </ul>
                        <div className = {styles.selectedClients}>
                            <span>
                                {selectedEmails.length} selecionado(s)
                            </span>
                            <Button variant = "outline-danger"
                                onClick = {cleanSelection}>
                                Limpar seleção
                            </Button>
                        </div>
                    </div>
                )}
            </section>
            <section className = {styles.clientSettings}>
                <h2> Dados do cliente </h2>
                <form>
                    <input value = {email} placeholder = "E-mail" disabled/>
                    <input type="number" value = {clientLicenses}
                        placeholder = "Dias da licença" disabled/>
                    <div style = {{ margin: "1em 0 0" }}>
                        <FloatingLabel className="mb-3"
                            label="Dias de licença">
                            <Form.Control min = {1}
                                value = {licenseDays} type="number" 
                                onChange = {changeLicenseDays}/>
                        </FloatingLabel>
                        <Button variant = "outline-primary" 
                            style = {{ height: "fit-content" }}
                            onClick = {giveLicense}>
                            Conceder licença(s)
                        </Button>
                    </div>
                    <Button variant = "danger" onClick = {deleteClient}>
                        Deletar usuário(s)
                    </Button>
                </form>
            </section>
        </section>
        
        <div className = {styles.searchContainer}>
            <input 
                type = "text" 
                value = {searchTerm} 
                onChange={searchUpdated}
                placeholder = {"Buscar cliente..."}
            />
            <span>
                {filteredClients.length} e-mail(s) encontrado(s)
            </span>
        </div>

        <section className = {styles.clientList}>
            <Table hover>
                <thead>
                    <tr>
                        {isAdmin ? (
                            <>
                            <th data-criteria = "botName"
                                onClick = {handleChangeCriteria}> 
                                Bot 
                            </th>
                            <th data-criteria = "seller"
                                onClick = {handleChangeCriteria}> 
                                Vendedor 
                            </th>
                            </>
                        ) : (
                            <th></th>
                        )}
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
                        <tr key = {client.email + client.botName}>
                            {isAdmin ? (
                                <>
                                <td> {client.botName} </td>
                                <td> {client.seller} </td>
                                </>
                            ) : (
                                <input type="checkbox" name="clients"
                                    value = {client.email}
                                    onChange = {selectEmail}
                                    checked = {isSelected(client.email)}/>
                            )}
                            <td> {client.email} </td>
                            <td> {client.license} </td>
                            <td> {client.updateAt} </td>
                            <Button variant = "outline-primary"
                                data-email = {client.email}
                                data-bot = {client.botName}
                                data-seller = {client.seller}
                                onClick = {selectClient}>
                                Visualizar
                            </Button>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <ReactPaginate
                breakLabel={'...'}
                nextLabel={'Próximo'}
                previousLabel={'Anterior'}
                pageCount={pageCount}
                pageRangeDisplayed={1}
                marginPagesDisplayed={1}
                onPageChange={handlePaginate}
                containerClassName={"pagination"}
                nextLinkClassName={"pagination__link"}
                previousLinkClassName={"pagination__link"}
                activeClassName={"pagination__link--active"}
                disabledClassName={"pagination__link--disabled"}
            />
        </section>
    </>)    
}
