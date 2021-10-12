import React, { createContext, ReactNode, useState } from 'react';
import { UserView, UserLicense, Trade } from 'models/Users';

interface UserContextData {
    email: string,
    createdAt: string,
    totalYield: Number,
    trades: Array<Trade>,
    initialBalance: Number,
    additionalInfo: Object,
    licenses: Array<UserLicense>,
    setUserData: (data: UserView) => void;
}

interface UserProviderProps {
    children: ReactNode;
}

export const UserContext = createContext({} as UserContextData);

export function UserProvider({ 
        children, ...rest 
    }: UserProviderProps ) {
   
    const [ email, setEmail ] = useState<string>("");
    const [ createdAt, setCreatedAt ] = useState<string>("");
    const [ trades, setTrades ] = useState<Array<Trade>>([]);
    const [ totalYield, setTotalYield ] = useState<Number>(0);
    const [ initialBalance, setInitialBalance ] = useState<Number>(0);
    const [ additionalInfo, setAdditionalInfo ] = useState<Object>({});
    const [ licenses, setLicenses ] = useState<Array<UserLicense>>([]);
 
    function setUserData(data: UserView) {
        setEmail(data.email);
        setTrades(data.trades);
        setLicenses(data.licenses);
        setCreatedAt(data.createdAt);
        setTotalYield(data.totalYield);
        setAdditionalInfo(data.additionalInfo);
        setInitialBalance(data.initialBalance);
    }

    return (
        <UserContext.Provider value = {{
            email, createdAt, licenses,
            totalYield, trades,
            initialBalance,
            additionalInfo,
            setUserData,
        }}>
            {children}
        </UserContext.Provider>
    )
}