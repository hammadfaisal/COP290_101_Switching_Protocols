import consts from "@/consts";
import useWindowSize from "@/hooks/useWindowSize";
import { Sort } from "@/types/sort";
import Image from "next/image";
import Link from "next/link";
import LoginLogout from "./LoginLogout";

const LeftBox = ({ setSort, setHome, home }: any) => {
    const handleSort =
        (s: Sort) => (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.checked) setSort(s);
            else setSort(Sort.hot);
        };
    const { width } = useWindowSize();


    return (
        <div className="flex flex-col items-start justify-start w-full">
            <div className="flex flex-col items-start justify-center w-full h-full">
                <button
                    onClick={() => setHome(true)}
                    className="w-full h-full flex items-center justify-start"
                >
                    <Image
                        src="/home.svg"
                        width={20}
                        height={20}
                        alt="home"
                        className="inline mr-2"
                    />
                    <span
                        className={`inline ${
                            home ? "font-bold underline" : ""
                        }`}
                    >
                        home
                    </span>
                </button>
                <button
                    onClick={() => setHome(false)}
                    className="w-full h-full flex items-center justify-start"
                >
                    <Image
                        src="/trending@2x.png"
                        width={20}
                        height={20}
                        className="inline mr-2"
                        alt="trending"
                    />
                    <span
                        className={`inline ${
                            !home ? "font-bold underline" : ""
                        }`}
                    >
                        trending
                    </span>
                </button>
            </div>
            <div className="w-full h-full my-12 border-t-2 border-b-2 border-stone-400 flex flex-col">
                <h3 className="text-lg md:text-xl font-bold">sort</h3>
                <span className="flex">
                    <input
                        type="radio"
                        id="new"
                        name="sort"
                        value="new"
                        onChange={handleSort(Sort.new)}
                    />
                    <label className="ml-4" htmlFor="new">
                        new
                    </label>
                </span>
                <span className="flex">
                    <input
                        type="radio"
                        id="top"
                        name="sort"
                        value="top"
                        onChange={handleSort(Sort.top)}
                    />
                    <label className="ml-4" htmlFor="top">
                        top
                    </label>
                </span>
                <span className="flex">
                    <input
                        type="radio"
                        id="hot"
                        name="sort"
                        value="hot"
                        onChange={handleSort(Sort.hot)}
                    />
                    <label className="ml-4" htmlFor="hot">
                        hot
                    </label>
                </span>
                <span className="flex">
                    <input
                        type="radio"
                        id="old"
                        name="sort"
                        value="old"
                        onChange={handleSort(Sort.old)}
                    />
                    <label className="ml-4" htmlFor="old">
                        old
                    </label>
                </span>
            </div>
            {/* new post button */}
            <div className="w-full h-full flex flex-col items-start justify-center">
                <Link
                    href="/p/create"
                    className="bg-stone-900 text-white font-bold py-2 px-4 rounded my-2"
                >
                    new&nbsp;post
                </Link>
                <Link
                    href="/c/create"
                    className="bg-stone-900 text-white font-bold py-2 px-4 rounded my-2"
                >
                    new&nbsp;community
                </Link>

            </div>
            {width <= consts.mdwidth ? (<LoginLogout />) : (null)}

        </div>
    );
};

export default LeftBox;
