import useAuth from "@/hooks/useAuth";
import Main from "@/components/Main";
import Image from "next/image";
import Auth from "@/components/Auth";
import Button from "@/components/Button";
import { useState, useRef, useMemo, useContext } from "react";
import { usePost } from "@/hooks/useApi";
import consts from "@/consts";
import { MsgDispatchContext } from "@/context/message";
import dp from "@/utils/dp";
import Head from "next/head";
import Navbar from "@/components/Navbar";

const Me = () => {
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const msgDispatch = useContext(MsgDispatchContext);
    const { user } = useAuth();
    const post = usePost();
    const fileRef = useRef<HTMLInputElement>(null);

    const onChangeOld = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOldPassword(e.target.value);
    };

    const onChangeNew = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPassword(e.target.value);
    };

    const update = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            if (fileRef.current?.files?.length) {
                const formData = new FormData();
                formData.append("file", fileRef.current.files[0]);
                fetch(`${consts.API_URL}/me/pic`, {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem(
                            "token"
                        )}`,
                    },
                    body: formData,
                })
                    .then(console.log)
                    .catch(console.log);
            }
            if (oldPassword && newPassword) {
                const res = await post("me/password", { old_password: oldPassword, new_password:newPassword });
                console.log(res);
                if (res.status === 200) {
                    msgDispatch("password updated");
                } else {
                    msgDispatch("old password is incorrect");
                }
            }
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <Auth>
            <Head>
                <title>me</title>
            </Head>

            <Main>
                <Navbar />
                <div className="flex flex-col items-center justify-center">
                    <Image className="rounded-full"
                        src={dp(user?.display_pic)}
                        width={100}
                        height={100}
                        alt="logo"
                    />
                    <h1 className="text-2xl md:text-3xl font-bold">{user?.username}</h1>
                </div>
                <form
                    className="grid grid-cols-4 gap-4 my-12"
                    onSubmit={update}
                >
                    <h2 className="col-span-4 text-lg md:text-xl font-bold">
                        Update Profile
                    </h2>
                    <label htmlFor="old_password">Old Password</label>
                    <input
                        type="password"
                        name="old_password"
                        id="old_password"
                        className="border-2 border-gray-300 rounded-md p-2 col-span-3"
                        onChange={onChangeOld}
                    />
                    <label htmlFor="old_password">New Password</label>
                    <input
                        type="password"
                        name="new_password"
                        id="new_password"
                        className="border-2 border-gray-300 rounded-md p-2 col-span-3"
                        onChange={onChangeNew}
                    />
                    <label htmlFor="display_pic">Display Picture</label>
                    <input
                        type="file"
                        name="display_pic"
                        id="display_pic"
                        className="border-2 border-gray-300 rounded-md p-2 col-span-3"
                        ref={fileRef}
                    />
                    <Button type="submit" className="col-span-4">
                        Update
                    </Button>
                </form>
            </Main>
        </Auth>
    );
};

export default Me;
