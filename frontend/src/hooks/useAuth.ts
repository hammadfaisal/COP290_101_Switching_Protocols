import { fetcher } from "./useApi";
import useSWR from "swr";

const useAuth = () => {
    const { data, isLoading, error, mutate } = useSWR(
        "me/info",
        fetcher(1000)
    );

    if (isLoading) return { isLoggedIn: false, user: null, isLoading, error, mutate };
    if (error) return { isLoggedIn: false, user: null, isLoading, error, mutate };

    return { isLoggedIn: true, user: data, isLoading, error, mutate };
};

export default useAuth;
