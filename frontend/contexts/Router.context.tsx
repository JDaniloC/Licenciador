import React, { createContext, ReactNode, useState } from 'react';
import BotList from 'components/BotList';
import Clients from 'components/Clients';
import Sellers from 'components/Sellers';
import Login from 'components/Login';

interface RouterContextData {
    isAuthenticated: boolean;
    setRoute: (route:string) => void;
    setIsAuthenticated: (value: boolean) => void;
}

interface RouterProviderProps {
    children: ReactNode;
    bots: {
        _id: string,
        name: string,
        title: string,
        imageURL: string
    }[]
}

export const RouterContext = createContext({} as RouterContextData);

export function RouterProvider({ 
        children, ...rest 
    }: RouterProviderProps ) {
   
    const [bots, _] = useState(rest.bots);
    const [route, setRoute] = useState("login");
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    return (
        <RouterContext.Provider value = {{
            setRoute,
            isAuthenticated, 
            setIsAuthenticated, 
        }}>
            {children}
            {(route == "login") ?
                <Login />
            : (route == "botList") ?
                <BotList bots = { bots }/>
            : (route == "clients") ?
                <Clients />
            : (route == "sellers") ?
                <Sellers bots = { bots }/> 
            :<> Rota não encontrada </>}
        </RouterContext.Provider>
    )
}