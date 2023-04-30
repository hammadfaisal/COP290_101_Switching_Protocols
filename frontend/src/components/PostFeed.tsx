import { fetcher, usePost } from "@/hooks/useApi";
import Link from "next/link";
import { useEffect, useState, useRef, useContext } from "react";
import useSWR from "swr";
import { faCaretUp, faCaretDown } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ago from "@/utils/ago";
import sanitize from "@/utils/sanitize";
import { MsgDispatchContext } from "@/context/message";

const PostFeed = ({ post: feedPost }: { post: any }) => {
    const [post, setPost] = useState<any>(feedPost);
    const [rendered, setRendered] = useState(false);
    const { data: user } = useSWR(
        () => (post?.user ? `u/${post.user}` : null),
        fetcher()
    );
    const { data: community } = useSWR(
        () => `c/info/${post.community}`,
        fetcher()
    );
    // 0 = no vote, 1 = upvote, -1 = downvote
    const { data: v, mutate: mutatev } = useSWR(
        () => (post?.id ? `p/${post.id}/vote` : null),
        fetcher(1000)
    );
    const { data: postt, mutate } = useSWR(() => `p/${post.id}`, fetcher(1000));
    const p = usePost();
    const msgDispatch = useContext(MsgDispatchContext);

    const upvote = () => {
        p(`p/${post.id}/upvote`, {})
            .then(() => {
                mutate();
                mutatev();
            })
            .catch(() => {
                msgDispatch("upvote failed");
            });
    };

    const downvote = () => {
        p(`p/${post.id}/downvote`, {})
            .then(() => {
                mutate();
                mutatev();
            })
            .catch(() => {
                msgDispatch("downvote failed");
            });
    };

    useEffect(() => {
        if (postt) setPost(postt);
    }, [postt]);

    useEffect(() => {
        if (!rendered) setRendered(true);
    }, [rendered]);

    if (!rendered) return null;
    if (!post) return null;

    return (
        <div
            key={post.id}
            className="my-4 p-4 bg-gray-100 rounded w-full flex flex-row"
        >
            <div className="flex flex-col justify-center items-center mr-8 h-12">
                <span className="cursor-pointer group" onClick={upvote}>
                    <FontAwesomeIcon
                        icon={faCaretUp}
                        size="xl"
                        className={`group-hover:text-rose-400 ${
                            v?.vote === 1 ? "text-rose-600" : ""
                        }`}
                    />
                </span>
                <span>{post.upvotes - post.downvotes}</span>
                <span className="cursor-pointer group" onClick={downvote}>
                    <FontAwesomeIcon
                        icon={faCaretDown}
                        size="xl"
                        className={`group-hover:text-rose-400 ${
                            v?.vote === -1 ? "text-rose-600" : ""
                        }`}
                    />
                </span>
            </div>
            <div className="w-full">
                <span>{user?.username} in</span>
                <Link href={`/c/${community?.name}`} className="ml-2">
                    c/{community?.name}
                </Link>
                <span className="text-gray-500"> · </span>
                <span className="text-gray-500">
                    {ago(new Date(post.time_created))} ago
                </span>
                <Link href={`/p/${post.id}`}>
                    <h1 className="text-2xl md:text-3xl font-bold">{post.title}</h1>
                </Link>
                <hr className="mb-4 bg-transparent w-full" />
                <p
                    className="text-gray-500 post-content"
                    dangerouslySetInnerHTML={{
                        __html: sanitize(post.content),
                    }}
                />
            </div>
        </div>
    );
};

export default PostFeed;
