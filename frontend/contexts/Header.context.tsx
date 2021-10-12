import React, { createContext, ReactNode, useState } from 'react';

interface HeaderContextData {
    changeDisplay: (string:string) => void;
    setCanBack: (option: boolean) => void;
    overlayDisplay: string;
    loginDisplay: string;
    canBack: boolean;
    
    setLicenses: (number:number) => void;
    setTests: (number:number) => void;
    licenses: number;
    tests: number;
    
    setBotTitle: (string:string) => void;
    setBotName: (string:string) => void;
    botTitle: string;
    botName: string;
}

interface HeaderProviderProps {
    children: ReactNode;
}

export const HeaderContext = createContext({} as HeaderContextData);

export function HeaderProvider({ 
        children, ...rest 
    }: HeaderProviderProps ) {
   
    const [overlayDisplay, setOverlayDisplay] = useState("flex")
    const [loginDisplay, setLoginDisplay] = useState("flex")

    const [licenses, setLicenses] = useState(0);
    const [tests, setTests] = useState(0);
    const [canBack, setCanBack] = useState(false);

    const [botTitle, setBotTitle] = useState("");
    const [botName, setBotName] = useState("");
 
    function changeDisplay(style:string) {
        setOverlayDisplay(style);
        setLoginDisplay(style);
    }

    return (
        <HeaderContext.Provider value = {{
            changeDisplay, overlayDisplay,
            loginDisplay, canBack,
            setLicenses, setTests,
            licenses, tests,
            setCanBack, botName,
            setBotName, botTitle,
            setBotTitle
        }}>
            {children}
        </HeaderContext.Provider>
    )
}