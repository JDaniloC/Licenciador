import styles from 'styles/components/ClientSearch.module.css';
import { useRef, useState, useContext } from 'react';
import { UserContext } from 'contexts/User.context';
import axios from 'axios';

export default function ClientSearch() {
    const [email, setEmail] = useState("");
    const emailRef = useRef();
    
    const { setUserData } = useContext(UserContext);

    function shakeInput(input: HTMLInputElement) {
        input.animate([   
            { transform: 'translateX(0px)' },
            { transform: 'translateX(-10px)' },
            { transform: 'translateX(10px)' },
            { transform: 'translateX(0px)' }
        ], { duration: 150, iterations: 2 })
    }
 
    async function handleLogin() {
        const { data } = await axios.get(
            "/api/users", { params: { email } }
        ).catch((err) => {
            console.error(err)
            return { data: {} }
        })

        if (data.email === undefined) {
            shakeInput(emailRef.current);
        } else {
            setUserData(data);
        }
    }
      
    function handleChangeEmail(evt) {
        setEmail(evt.target.value)
    }

    return (
        <form method="post" className = {styles.searchForm}>
            <input placeholder = "Buscar e-mail..." type="email" 
                onChange = {handleChangeEmail}
                required ref = {emailRef}/>
            <button type = "button" onClick = {handleLogin}> 
                Procurar 
            </button>
        </form>
    )
}