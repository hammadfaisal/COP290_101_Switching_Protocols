import useAuth from "@/hooks/useAuth";
import Link from "next/link";
import { useEffect, useState } from "react";


const logOutInClass =
    "inline-block text-md px-4 py-2 leading-none border rounded text-stone-900 border-stone-400 hover:border-transparent hover:text-gray-900 hover:bg-stone-400";

const LoginLogout = () => {
    const auth = useAuth();
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => {
        setIsMounted(true);
    }, []);
    const logout = () => {
        localStorage.removeItem("token");
        auth.mutate?.();
    };
    if (!isMounted) {
        return null;
    }
    return (
        <>
        {auth.isLoggedIn ? (
            <button className={logOutInClass} onClick={logout}>
                Logout
            </button>
        ) : (
            <Link href="/login" className={logOutInClass}>
                login
            </Link>
        )}
        </>
    );
}

export default LoginLogout;