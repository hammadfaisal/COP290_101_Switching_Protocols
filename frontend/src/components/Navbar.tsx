import Image from "next/image";
import Search from "./Search";
import useAuth from "@/hooks/useAuth";
import { useRouter } from "next/router";
import Link from "next/link";
import dp from "@/utils/dp";
import LoginLogout from "./LoginLogout";
import useWindowSize from "@/hooks/useWindowSize";
import consts from "@/consts";

interface INavbarProps {
    search?: boolean;
}


const Navbar = (props: INavbarProps) => {
    const auth = useAuth();
    const { width } = useWindowSize();

    return (
        <div className="flex flex-col w-full justify-center items-center">
            <nav className="grid grid-cols-7 grid-rows-1 md:px-12 w-full">
                <Link
                    className="flex flex-row items-center text-white col-start-1 col-end-3"
                    href="/"
                >
                    <Image
                        src="/logo@2x.png"
                        width={50}
                        height={50}
                        alt="mosaic"
                    />
                    <span className="font-semibold text-lg md:text-xl tracking-tight text-stone-900 text-2xl md:text-3xl hidden md:inline-block">
                        Mosaic
                    </span>
                </Link>
                {props.search && (
                    <div className="w-full max-w-full flex justify-center col-span-5">
                        <Search />
                    </div>
                )}
                <div className="self-end flex justify-center items-center col-start-6 col-start-8">
                    <Link
                        href="/u/me"
                        className="flex justify-center items-center text-md px-4 py-2 leading-none text-stone-900 hover:text-gray-800"
                    >
                        <Image
                            src={dp(auth.user?.display_pic)}
                            width={40}
                            height={40}
                            alt="profile"
                            className="inline mr-2 rounded-full w-10 h-10"
                        />
                        <span className="hidden md:inline">Profile</span>
                    </Link>
                    {width > consts.mdwidth ? (<LoginLogout />) : (null)}
                </div>
            </nav>
        </div>
    );
};

export default Navbar;
