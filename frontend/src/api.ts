import LRUCache from "lru-cache";
import consts from "./consts";

// const cache = new LRUCache<string, any>({ max: 100, ttl: 1000 * 60 * 5 });

export const post = async (p: string, data: any) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${consts.API_URL}/${p}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    return res.json();
};

export const get = async (p: string) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${consts.API_URL}/${p}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    const status = res.status;
    const data = await res.json();

    return { status, data };
};
