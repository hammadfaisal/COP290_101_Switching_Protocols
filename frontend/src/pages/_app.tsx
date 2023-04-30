import "@/styles/globals.css";
import { useCallback, useEffect, useReducer } from "react";
import type { AppProps } from "next/app";
import { SWRConfig } from "swr";

import { MsgDispatchContext, msgReducer } from "@/context/message";
import Toasts from "@/components/Toasts";
import { fetcher } from "@/hooks/useApi";


export default function App({ Component, pageProps }: AppProps) {
    const [messages, setMessages] = useReducer(msgReducer, []);

    const dispatch = useCallback((message: string) => {
        const id = Math.random().toString(36).substring(2, 9);
        setMessages({ type: "NEW", payload: { message, id } });
        setTimeout(() => {
            setMessages({ type: "REMOVE", payload: { id } });
        }, 1500);
    }, []);

    return (
        <MsgDispatchContext.Provider value={dispatch}>
            <SWRConfig 
                value={{
                    fetcher: fetcher(),
                    revalidateOnFocus: false,
                    revalidateOnReconnect: true,
                }}
            >
            <Toasts messages={messages} />
            <div className="w-full h-screen">
                <Component {...pageProps} />;
            </div>
            </SWRConfig>
        </MsgDispatchContext.Provider>
    );
}
