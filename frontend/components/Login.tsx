import styles from '../styles/components/Login.module.css';
import { HeaderContext } from '../contexts/Header.context';
import { RouterContext } from '../contexts/Router.context';
import { useContext, useEffect, useRef, useState } from 'react';
import { serverURL } from '../config';
import Head from 'next/head'
import axios from 'axios';

export interface LoginData {
    data: {
        botList: []
        email: string;
        password: string;
        type: string;
    }
}

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const {
        setLicenses, setTests,
        overlayDisplay, loginDisplay,
        changeDisplay
    } = useContext(HeaderContext);
    const {
        setRoute
    } = useContext(RouterContext);

    const emailRef = useRef();
    const passwordRef = useRef();
    
    useEffect(() => {
        if (localStorage.getItem("account")) {
            removeLogin();
        }
    })

    function shakeInput(input: HTMLInputElement) {
        input.animate([   
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0px)' }
        ], { duration: 150, iterations: 2 })
    }
 
    async function handleLogin() {
        const { data }:LoginData = await axios.post(
            serverURL + "/api/login", { email, password }
        ).catch((err) => {
            console.error(err)
            return { data: {
                email: undefined,
                password: undefined,
                botList: undefined,
                type: undefined,
            } }
        })

        if (data.type === undefined) {
            shakeInput(emailRef.current);
            shakeInput(passwordRef.current);   
        } else {
            localStorage.setItem(
                'account', JSON.stringify(data));
            removeLogin()
        }
    }

    function removeLogin() {
        changeDisplay("none");
        
        const account = JSON.parse(localStorage.getItem('account'));
        
        
        if (account.type == "admin") {
            setRoute("sellers");
        } else {
            setLicenses(account.licenses);
            setTests(account.tests);
            setRoute("botList");
        }
    }
      
    return (
        <>
      <Head>
        <title> Licenciador | Login </title>
      </Head>

        <span className="overlay" style = {{ display: overlayDisplay }}></span>
        <section className = {styles.login} style = {{ display: loginDisplay }}>
            <form method="post">
                <h2> Licenciador </h2>
                <input placeholder = "E-mail" type="email" 
                    required ref = {emailRef}
                    onChange = {(evt) => {
                        setEmail(evt.target.value)}}/>
                <input placeholder = "Senha" type="password" 
                    required ref = {passwordRef}
                    onChange = {(evt) => {
                        setPassword(evt.target.value)}}/>
                
                <button type = "button" onClick = {handleLogin}> 
                    Entrar 
                </button>
            </form>
        </section>
        </>
    )
}