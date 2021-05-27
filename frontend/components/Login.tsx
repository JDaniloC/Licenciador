import styles from '../styles/components/Login.module.css';
import { HeaderContext } from '../contexts/Header.context';
import { useContext, useRef, useState } from 'react';
import { serverURL } from '../config';
import Head from 'next/head'
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const {
        setLicenses, setTests,
        overlayDisplay, loginDisplay,
        changeDisplay
    } = useContext(HeaderContext);
    const emailRef = useRef();
    const passwordRef = useRef();
    
    function shakeInput(input: HTMLInputElement) {
        input.animate([   
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0px)' }
        ], { duration: 150, iterations: 2 })
    }
 
    async function handleLogin() {
        const {data} = await axios.post(
            serverURL + "/login", { email, password }
        ).catch((err) => {
            console.error(err)
            return { data: {} }
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
            // $("main").load("views/sellers.html");
        } else {
            setLicenses(account.licenses);
            setTests(account.tests);
            // $("main").load("views/botlist.html");
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