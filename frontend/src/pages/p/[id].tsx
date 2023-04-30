import { useEffect, useState } from "react";
import useSWR from "swr";
import Navbar from "@/components/Navbar";
import { usePost, fetcher } from "@/hooks/useApi";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretDown, faCaretUp } from "@fortawesome/free-solid-svg-icons";
import consts from "@/consts";
import Link from "next/link";
import Main from "@/components/Main";
import ago from "@/utils/ago";
import Head from "next/head";
import Image from "next/image";
import sanitize from "@/utils/sanitize";
import CommentBox from "@/components/CommentBox";
import Comment from "@/components/Comment";
import dp from "@/utils/dp";
import useAuth from "@/hooks/useAuth";
import Button from "@/components/Button";
import { useRouter } from "next/router";

interface PostProps {
    post: any;
    user: any;
    community: any;
    comments: any[];
}

const Post = ({ post, user, community, comments }: PostProps) => {
    const [poststate, setPostState] = useState(post);
    const { data, mutate } = useSWR(
        () => (post?.id ? `p/${post.id}/vote` : null),
        fetcher(500)
    );
    const { data: postf, mutate: mutatePost } = useSWR(
        () => (post?.id ? `p/${post.id}` : null),
        fetcher(500)
    );
    const { data: commentsf } = useSWR(
        () => (post?.id ? `p/${post.id}/comments` : null),
        fetcher()
    );
    const [commentss, setCommentsS] = useState(comments || []);
    const { vote } = data || {};
    const [mounted, setMounted] = useState(false);
    const title = `${post.title} - ${community.name}`;
    const router = useRouter();

    const p = usePost();
    const auth = useAuth();
    const upvote = async () => {
        try {
            await p(`p/${post.id}/upvote`, {});
            await mutate();
            await mutatePost();
        } catch (e) {
            console.log(e);
        }
    };

    const downvote = async () => {
        try {
            await p(`p/${post.id}/downvote`, {});
            await mutate();
            await mutatePost();
        } catch (e) {
            console.log(e);
        }
    };

    useEffect(() => {
        if (postf) setPostState(postf);
    }, [postf]);

    useEffect(() => {
        if (commentsf) setCommentsS(commentsf);
    }, [commentsf]);

    useEffect(() => {
        setMounted(true);
    }, []);

    const deletePost = async () => {
        try {
            await p(`p/${post.id}/delete`, {});
            router.push(`/`)
        }
        catch (e) {
            console.log(e)
        }
    };


    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <Main>
                <Navbar search />
                <div className="my-4 py-4 px-2 rounded w-full flex-col">
                    <div
                        className="text-gray-500 font-bold text-inherit flex justify-between items-center"
                    >
                        <div>
                        <Link  href={`/u/${user?.username}`}>
                        <Image
                            src={dp(user?.display_pic)}
                            alt="dp"
                            width={50}
                            height={50}
                            className="rounded-full inline"
                        />
                        <span className="ml-4">u/{user?.username}</span>
                        </Link>
                        <span className="mx-2 my-4">
                            {mounted ? ago(new Date(post.time_created)) : ""}{" "}
                            ago
                        </span>
                        </div>
    
                        {auth.isLoggedIn && auth.user?.id === poststate.user ? (<button className="text-red-700 hover:text-red-900 hover:underline"  onClick={deletePost}>Delete Post</button>) : null}

                    </div>
                    <div className="flex flex-row">
                        <div className="flex flex-col items-center justify-between mr-8 py-4">
                            <div className="flex flex-col items-center justify-between h-16">
                                <span
                                    className="cursor-pointer group"
                                    onClick={upvote}
                                >
                                    <FontAwesomeIcon
                                        size="2x"
                                        icon={faCaretUp}
                                        className={`group-hover:text-rose-400 ${
                                            vote === 1 ? "text-rose-600" : ""
                                        }`}
                                    />
                                </span>
                                <span className="text-xl md:text-2xl font-bold text-gray-500">
                                    {poststate.upvotes - poststate.downvotes}
                                </span>
                                <span
                                    className="cursor-pointer group"
                                    onClick={downvote}
                                >
                                    <FontAwesomeIcon
                                        size="2x"
                                        icon={faCaretDown}
                                        className={`group-hover:text-rose-400 ${
                                            vote === -1 ? "text-rose-600" : ""
                                        }`}
                                    />
                                </span>
                            </div>
                        </div>
                        <div className="w-full">
                            <h1 className="text-2xl md:text-3xl font-bold my-4">
                                {poststate.title}
                            </h1>
                            <p
                                className="bg-gray-200 p-4 my-2 w-full rounded break-words"
                                dangerouslySetInnerHTML={{
                                    __html: mounted
                                        ? sanitize(poststate.content)
                                        : "",
                                }}
                            />
                        </div>
                    </div>
                    <CommentBox post_id={post.id} />
                    {commentss.map((comment) => (
                        <Comment
                            key={comment.id}
                            comment={comment}
                            post_id={post.id}
                            depth = {0}
                        />
                    ))}
                </div>
            </Main>
        </>
    );
};

export const getServerSideProps = async (ctx: any) => {
    const { id } = ctx.params;
    const post = await fetch(`${consts.API_URL}/p/${id}`);
    const postjson = await post.json();
    if (!postjson) return { notFound: true };

    const user = await fetch(`${consts.API_URL}/u/${postjson.user}`);
    let userjson = await user.json();
    if (!userjson) return { notFound: true };

    const community = await fetch(
        `${consts.API_URL}/c/info/${postjson.community}`
    );
    const communityjson = await community.json();
    if (!communityjson) return { notFound: true };

    const comments = await fetch(`${consts.API_URL}/p/${postjson.id}/comments`);
    const commentsjson = await comments.json();
    if (!commentsjson) return { notFound: true };

    return {
        props: {
            post: postjson,
            user: userjson,
            community: communityjson,
            comments: commentsjson,
        },
    };
};

export default Post;
