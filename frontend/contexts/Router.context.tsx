import React, { createContext, ReactNode, useEffect, useState } from 'react';
import BotList from '../components/BotList';
import Clients from '../components/Clients';
import Login from '../components/Login';

interface RouterContextData {
    setRoute: (route:string) => void;
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

    return (
        <RouterContext.Provider value = {{
            setRoute
        }}>
            {children}
            {(route == "login") ?
                <Login />
            : (route == "botList") ?
                <BotList bots = { bots }/>
            : (route == "clients") ?
                <Clients />
            : <> </>}
        </RouterContext.Provider>
    )
}