import { createContext, useCallback, useContext } from "react";
import type { Dispatch } from "react";

export interface Msg {
    id: string;
    message?: string;
};

export const msgReducer = (
    state: Msg[],
    action: { type: string; payload: Msg }
) => {
    switch (action.type) {
        case "NEW":
            return [...state, action.payload];
        case "CLEAR":
            return [];
        case "REMOVE":
            return state.filter((msg) => msg.id !== action.payload.id);
        default:
            return state;
    }
};

export const MsgContext = createContext([] as Msg[]);

export const MsgDispatchContext = createContext<(value: string) => void>(() => {});

