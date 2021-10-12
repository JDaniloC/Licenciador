import { useRouter } from 'next/router'
import React, { useEffect } from 'react';

export default function PageNotFound() {
    const router = useRouter();

    useEffect(() => {
        router.push("/clients");
    }, [])

    return (
        <div style = {{
            width: "100vw",
            height: "100vh",
            display: "flex",
            
        }}>
            <h1 style = {{ margin: "auto" }}> 
                Opa! Tá indo pra onde? <br/>
            </h1>
        </div>
    )
}