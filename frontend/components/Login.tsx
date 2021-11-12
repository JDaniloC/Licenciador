import { useContext, useEffect, useRef, useState } from 'react';
import { HeaderContext } from 'contexts/Header.context';
import { RouterContext } from 'contexts/Router.context';

import Head from 'next/head'
import axios from 'services/api';
import styles from 'styles/components/Login.module.css';

export interface LoginData {
    data: {
        botList: []
        email: string;
        token: string;
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
        setRoute,
        setIsAuthenticated
    } = useContext(RouterContext);

    const emailRef = useRef();
    const passwordRef = useRef();
    
    useEffect(() => {
        if (localStorage.getItem("account")) {
            removeLoginComponent();
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
            "/api/login", { email, password }
        ).catch((err) => {
            console.error(err)
            return { data: {
                email: undefined,
                botList: undefined,
                type: undefined,
                token: null
            } }
        })

        if (!data.token) {
            shakeInput(emailRef.current);
            shakeInput(passwordRef.current);   
        } else {
            data["since"] = new Date().getTime();
            localStorage.setItem('account', 
                JSON.stringify(data));
            removeLoginComponent()
        }
    }

    async function verifyAuthentication() {
        const account = JSON.parse(localStorage.getItem('account'));
        const todayTime = new Date().getTime()
        const difference = (todayTime - account["since"]) / 1000;
        
        if (difference > 3600) {
            const { data } = await axios.get("/api/login", { 
                headers: { authorization: account.token } 
            }).catch((err) => {
                console.error(err)
                return { data: {
                    auth: false, message: "Server error",
                } }
            })
            
            if (!data.auth) {
                localStorage.removeItem('account');
                localStorage.removeItem('bot');
                return
            }
        }
        return account;
    }

    async function removeLoginComponent() {
        const account = await verifyAuthentication();
        if (account === undefined) return
        
        setIsAuthenticated(true);
        changeDisplay("none");
        if (account.type === "admin") {
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