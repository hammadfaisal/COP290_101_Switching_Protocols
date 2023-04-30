import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import consts from "@/consts";
import Head from "next/head";
import Image from "next/image";
import { identicon } from "minidenticons";
import Link from "next/link";

const Register = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const svgURI = useMemo(
        () =>
            "data:image/svg+xml;utf8," +
            encodeURIComponent(identicon(username)),
        [username]
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await fetch(`${consts.API_URL}/u/create`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username,
                    password,
                    display_pic: svgURI,
                }),
            });
            if (!response.ok) {
                const error = await response.json();
                setError(error.error);
                setUsername("");
                setPassword("");
                return;
            }
            router.push("/login");
        } catch (error : any) {
            setError(error.error);
        }
    };
    return (
        <>
            <Head>
                <title>Mosaic Register</title>
            </Head>
            <div className="h-screen w-screen overflow-x-hidden grid grid-row-3 grid-cols-1 bg-light">
                <div className="flex flex-col items-center justify-center w-full row-span-2">
                    <Image
                        src="/logo@2x.png"
                        width={100}
                        height={100}
                        alt="logo"
                    />
                    <h1 className="text-4xl font-bold">Mosaic</h1>
                    <form
                        className="flex flex-col items-center justify-center w-full max-w-xs md:max-w-sm mt-8 space-y-4"
                        onSubmit={handleSubmit}
                    >
                        <Image
                            src={svgURI}
                            width={100}
                            height={100}
                            alt="logo"
                        />
                        <input
                            className="w-full px-4 py-2 placeholder:text-amber-900 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-800"
                            type="text"
                            placeholder="Username"
                            value={username}
                            required
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <input
                            className="w-full px-4 py-2 placeholder:text-amber-900 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-800"
                            type="password"
                            placeholder="Password"
                            value={password}
                            required
                            onChange={(e) => setPassword(e.target.value)}
                        />

                        <button
                            className="w-full px-4 py-2 bg-gray-100 rounded-md hover:bg-amber-900 hover:text-gray-100 transition-all"
                            type="submit"
                        >
                            Register
                        </button>
                    </form>
                    <Link
                        href="/login"
                        className="text-stone-900 hover:text-stone-800 hover:underline font-semibold text-lg md:text-xl my-12"
                    >
                        Go back to Login
                    </Link>
                </div>
                <div className="w-full row-span-1 flex justify-center relative">
                    <img
                        src="/Bottom Waves.svg"
                        alt="bottom waves"
                        className="absolute bottom-0 scale-125"
                    />
                </div>
            </div>
        </>
    );
};

export default Register;
