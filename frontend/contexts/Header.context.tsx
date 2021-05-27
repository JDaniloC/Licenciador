import React, { createContext, ReactNode, useEffect, useState } from 'react';
import Header from '../components/Header';

interface HeaderContextData {
    changeDisplay: (string:string) => void;
    overlayDisplay: string;
    loginDisplay: string;

    setLicenses: (number:number) => void;
    setTests: (number:number) => void;
    licenses: number;
    tests: number;
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
 
    function changeDisplay(style:string) {
        setOverlayDisplay(style);
        setLoginDisplay(style);
    }

    return (
        <HeaderContext.Provider value = {{
            changeDisplay, overlayDisplay,
            loginDisplay,
            setLicenses, setTests,
            licenses, tests
        }}>
            <Header tests = {tests}
                licenses = {licenses}
                changeDisplay = {changeDisplay}
            /> 
            {children}
        </HeaderContext.Provider>
    )
}