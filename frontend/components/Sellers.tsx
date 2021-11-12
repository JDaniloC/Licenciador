import { RouterContext } from 'contexts/Router.context';
import { useEffect, useState, useContext } from 'react';

import Head from 'next/head'
import axios from 'services/api';
import Button from 'react-bootstrap/Button';
import styles from 'styles/components/Sellers.module.css';

interface Bot {
    _id: string,
    name: string,
    title: string,
    imageURL: string
}

export interface SellersData {
    data: {
        botList: []
        email: string;
        password: string;
        showBots: boolean;
        type: string;
    }[]
}

export default function Clients({ bots }: { bots: Bot[] }) {
    const [sellers, setSellers] = useState({});
    const [email, setEmail] = useState("");
    const [licenses, setLicenses] = useState("");
    const [showBots, setShowBots] = useState(false);
    const [sellerBots, setSellerBots] = useState([]);

    const { setIsAuthenticated } = useContext(RouterContext);

    async function loadSellers() {
        const account = JSON.parse(localStorage.getItem('account'));
        axios.get(
            "/api/sellers/", {
            params: { email: account.email }
        }).then(({ data }: SellersData) => {
            const tempSellers = {};
            Object.keys(data).forEach(index => {
                const seller = data[index];
                if (seller.type === "seller") {
                    tempSellers[seller.email] = seller;
                }
            });
            setSellers(tempSellers);
        }).catch((error) => {
            if (error.response.status === 401) {
                setIsAuthenticated(false);
            }
        });

    }

    useEffect(() => {
        loadSellers();
    }, [])

    async function saveSeller() {
        function searchSeller(email, data) {
            if (sellers.hasOwnProperty(email)) {
                sellers[email].licenses = data.licenses;
                sellers[email].botList = data.botList;
                sellers[email].showBots = data.showBots;
            } else {
                let newSellers = sellers;
                newSellers[email] = data;
                setSellers(newSellers);
            }
        }
        const account = JSON.parse(localStorage.getItem('account'));
        if (!account) return


        const admin = account.email;
        axios.post("/api/sellers/", { 
            sellerEmail: email, creatorEmail: admin, 
            botList: sellerBots, showBots
        }).then(({ data }) => {
            searchSeller(email, data)
            
            setEmail("");
            setLicenses("");
            setSellerBots([]);
            setShowBots(false);
        }).catch((error) => {
            if (error.response.status === 401) {
                setIsAuthenticated(false);
            }
        });
    }
    
    async function deleteSeller() {
        const account = JSON.parse(localStorage.getItem('account'));
        if (!account) return


        const admin = account.email;
        await axios.delete("/api/sellers/", {
            params: { email, creatorEmail: admin }
        }).then(() => {
            setEmail("");
            loadSellers();
            setSellerBots([]);
            setShowBots(false);
        }).catch((error) => {
            if (error.response.status === 401) {
                setIsAuthenticated(false);
            }
        });
    }
    
    function setSelectedBots(check:boolean, name:string) {
        if (check) {
            setSellerBots([...sellerBots, name]);
        } else {
            setSellerBots(sellerBots.filter((bot) => (bot !== name)));
        }
    }

    function selectSeller(value: string) {
        let bots: [],
            email = "", 
            licenses: "",
            checked = false
        if (value !== "") {
            email = value
            bots = sellers[value].botList
            checked = sellers[value].showBots
            licenses = sellers[value].licenses
        }
        setEmail(email);
        setSellerBots((bots !== undefined) ? bots : []);
        setShowBots(checked);
        setLicenses(licenses);
    }
    
    return (<>
        <Head>
            <title> Licenciador | Sellers </title>
        </Head>
        <section className ="dashboard">
            <section className = {styles.sellers}>
                <div>
                    <h2> Vendedores cadastrados </h2>
                    <select value = {email}
                        onChange = {({ target }) => {selectSeller(target.value)}}>
                        <option value=""> 
                            Selecionar 
                        </option>
                        {Object.keys(sellers).map((seller) => (
                            <option value={seller} key = {seller}>
                                {seller}
                            </option>
                        ))}
                    </select>
                </div>
                <div> 
                    <h2> Cadastrar novo vendedor </h2>
                    <form>
                        <input type="email" placeholder="E-mail" value = {email}
                            onChange = {({ target }) => {setEmail(target.value)}}/>
                        <input type="number" min = {1} value = {licenses}
                            placeholder = "Quantidade de licenças" disabled/>
                        <div className = {styles.showBots}>
                            <label htmlFor = "show"> Mostrar demais bots </label>
                            <input type="checkbox" name="show" checked = {showBots}
                                onChange = {({ target }) => {setShowBots(target.checked)}}/>
                        </div>
                        <Button onClick = {saveSeller}> 
                            Adicionar/Salvar vendedor 
                        </Button>
                        <Button variant = "danger" onClick = {deleteSeller}>
                            Deletar vendedor
                        </Button>
                    </form>
                </div>
            </section>

            <section className = {styles.botSelection}>
                {bots?.map((bot) => (
                    <label key = {bot.name} htmlFor = {bot.name}>
                        <input type="checkbox" id = {bot.name}
                            onChange = {({ target }) => setSelectedBots(
                                target.checked, bot.name)}
                            checked = {(sellerBots?.indexOf(bot.name) !== -1)}/>
                        <span>
                            <h3> {bot.title} </h3>
                            <div>
                                <img src = {bot.imageURL} alt = "Bot icon" />
                            </div>
                        </span>
                    </label>
                ))}
            </section>
        </section>
    </>)    
}
