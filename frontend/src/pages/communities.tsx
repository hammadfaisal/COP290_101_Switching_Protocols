import { useEffect, useState } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Main from "@/components/Main";
import { get } from "@/api";
import Auth from "@/components/Auth";

export default function Communities() {
    const [communities, setCommunities] = useState<string[]>([]);

    useEffect(() => {
        get("c/get").then(console.log).catch(console.log);
    });

    return (
        <>
            <Head>
                <title>Mosaic</title>
            </Head>
            <Auth>
                <Main>
                    <Navbar />
                    <div className="flex flex-row flex-grow w-full"></div>
                </Main>
            </Auth>
        </>
    );
}
