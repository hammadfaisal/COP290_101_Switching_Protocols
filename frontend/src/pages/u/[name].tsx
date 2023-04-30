import Main from "@/components/Main";
import PostFeed from "@/components/PostFeed";
import consts from "@/consts";
import Image from "next/image";
import { useMemo, useState } from "react";
import Head from "next/head";
import CommentParent from "@/components/CommentParent";
import dp from "@/utils/dp";
import Navbar from "@/components/Navbar";

const User = ({ user, posts, comments }: any) => {
    const [showPosts, setShowPosts] = useState(true);
    return (
        <>
            <Head>
                <title>{user.username}</title>
            </Head>
            <Main>
                <Navbar search />
                <div className="flex flex-col items-center justify-center">
                    <Image
                        src={dp(user.display_pic)}
                        width={200}
                        height={200}
                        alt="dp"
                        className="rounded-full"
                    />
                    <h1 className="text-xl md:text-2xl font-bold">{user.username}</h1>
                    <p className="text-gray-500">{user.bio}</p>
                </div>
                <div className="flex items-center justify-center my-4">
                    <span
                        className={`px-2 py-1 ${
                            showPosts ? "bg-gray-200 rounded text-gray-800" : ""
                        }`}
                        onClick={() => setShowPosts(true)}
                    >
                        Posts
                    </span>
                    <span
                        className={`px-2 py-1 ${
                            !showPosts
                                ? "bg-gray-200 rounded text-gray-800"
                                : ""
                        }`}
                        onClick={() => setShowPosts(false)}
                    >
                        Comments
                    </span>
                </div>
                <div
                    className={`flex flex-col justify-center ${
                        showPosts ? "" : "hidden"
                    }`}
                >
                    <h1 className="text-xl md:text-2xl font-bold">Posts</h1>
                    {posts.map((post: any) => (
                        <PostFeed key={post.id} post={post} />
                    ))}
                </div>
                <div
                    className={`flex flex-col justify-center ${
                        !showPosts ? "" : "hidden"
                    }`}
                >
                    <h1 className="text-xl md:text-2xl font-bold">Comments</h1>
                    {comments.map((comment: any) => (
                        <CommentParent
                            key={comment.id}
                            comment={comment}
                            parent
                        />
                    ))}
                </div>
            </Main>
        </>
    );
};

export const getServerSideProps = async (ctx: any) => {
    const { name } = ctx.params;

    const res = await fetch(`${consts.API_URL}/u/${name}/info`);

    if (!res.ok) {
        return {
            notFound: true,
        };
    }

    let user = await res.json();

    const postsres = await fetch(`${consts.API_URL}/u/${user.id}/posts/0`);

    const { posts, pages } = await postsres.json();

    const commentsres = await fetch(
        `${consts.API_URL}/u/${user.id}/comments/0`
    );

    const { comments, pages: commentPages } = await commentsres.json();

    return {
        props: {
            user,
            posts,
            pages,
            comments,
            commentPages,
        },
    };
};

export default User;
