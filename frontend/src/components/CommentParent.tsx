import { fetcher } from "@/hooks/useApi";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import Comment from "./Comment";
import sanitize from "@/utils/sanitize";
import Link from "next/link";
import dp from "@/utils/dp";

const CommentParent = ({ comment }: any) => {
    const { data: user } = useSWR(
        () => (comment?.user ? `u/${comment.user}` : null),
        fetcher(1000 * 60 * 5)
    );
    const { data } = useSWR(
        () => (comment?.id ? `cm/${comment.id}/parent` : null),
        fetcher()
    );
    const { parent, post } = useMemo(() => {
        return {
            parent: data?.parent,
            post: data?.post,
        };
    }, [data]);
    const { data: postuser } = useSWR(
        () => (post?.user ? `u/${post.user}` : null),
        fetcher(1000 * 60 * 5)
    );
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="w-full bg-gray-100 rounded p-4 my-4">
            <div className="flex flex-col w-full items-center">
                {post && (
                    <div className="w-full">
                        <h2 className="text-xl md:text-2xl font-bold block">
                            {post.title}
                        </h2>
                        <div className="flex justify-start items-center">
                            <span className="text-md font-bold inline mx-2">
                                by
                            </span>
                            <Link href={`/u/${postuser?.username}`} className="inline">
                                <div className="flex flex-row w-full justify-center items-center">
                                    <Image
                                        src={dp(postuser?.display_pic)}
                                        width={40}
                                        height={40}
                                        className="rounded-full mr-2"
                                        alt="dp"
                                    />
                                    <h2 className="font-bold">
                                        u/{postuser?.username}
                                    </h2>
                                </div>
                            </Link>
                        </div>
                    </div>
                )}
                {parent && <Comment comment={parent} />}
                <div className="flex flex-col w-full bg-gray-200 p-4 rounded">
                    <div className="flex flex-row w-full items-center">
                        <Image
                            className="inline rounded-full mr-2"
                            src={dp(user?.display_pic)}
                            width={40}
                            height={40}
                            alt="dp"
                        />
                        <h2 className="text-lg font-bold">
                            <Link href={`/u/${user?.username}`}>
                                u/{user?.username}
                            </Link>
                        </h2>
                    </div>
                    <div
                        className={`flex flex-col w-auto ml-5 mt-1 pl-2 border-l-2 border-gray-500`}
                    >
                        <div className="flex flex-row">
                            <div className="w-11/12">
                                <p
                                    className="text-lg"
                                    dangerouslySetInnerHTML={{
                                        __html: mounted
                                            ? sanitize(comment.content)
                                            : "",
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentParent;
