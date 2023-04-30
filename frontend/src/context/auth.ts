import { createContext } from "react";
import type { Dispatch } from "react";

const defaultUser: User = {
    username: "",
};

export const authReducer = (state: User, action: { type: string; payload: User }) => {
    switch (action.type) {
        case "LOGIN":
            return action.payload;
        case "LOGOUT":
            return defaultUser;
        default:
            return state;
    }
};

export const AuthContext = createContext(defaultUser);

export const AuthDispatchContext = createContext<Dispatch<{ type: string; payload: User }>>(() => {});
