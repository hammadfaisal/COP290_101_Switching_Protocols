import { useCallback, useContext } from "react";
import LRUCache from "lru-cache";
import consts from "@/consts";
import { MsgDispatchContext } from "@/context/message";

const cache = new LRUCache<string, any>({ max: 100, ttl: 1000 * 5 });

export const usePost = () => {
    const msgDispatch = useContext(MsgDispatchContext);

    const post = useCallback(
        async (p: string, data: any) => {
            const token = localStorage.getItem("token");

            const res = await fetch(`${consts.API_URL}/${p}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            });

            const status = res.status;

            if (status === 200) {
                return { status, data: await res.json() };
            }
            const { error } = await res.json();
            msgDispatch(error);
            return { status, data: null };
        },
        [msgDispatch]
    );

    return post;
};

export const useGet = () => {
    const msgDispatch = useContext(MsgDispatchContext);

    const get = useCallback(
        async (p: string) => {
            const token = localStorage.getItem("token");

            if (cache.has(p)) {
                return { status: 0, data: cache.get(p) };
            }

            const res = await fetch(`${consts.API_URL}/${p}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const status = res.status;
            let data = null;
            if (status === 200) {
                data = await res.json();
                cache.set(p, data);
            } else {
                const { error } = await res.json();
                msgDispatch(JSON.stringify(error));
            }
            return { status, data };
        },
        [msgDispatch]
    );

    return get;
};

export class FetchError extends Error {
    info: any;
    status: number;

    constructor(message: string, info: any, status: number) {
        super(message);
        this.info = info;
        this.status = status;
    }

}

export const fetcher =
    (ttl = 1000 * 5) =>
    async (p: string) => {
        if (!p) return null;

        if (cache.has(p)) {
            return cache.get(p);
        }

        const token = localStorage.getItem("token");
        const res = await fetch(`${consts.API_URL}/${p}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await res.json();

        if (!res.ok) {
            const error = new FetchError(
                `An error occurred while fetching ${p}`,
                data,
                res.status
            );
            throw error;
        }

        cache.set(p, data, { ttl });

        return data;
    };
