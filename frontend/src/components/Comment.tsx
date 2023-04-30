import { fetcher, usePost } from "@/hooks/useApi";
import useAuth from "@/hooks/useAuth";
import {
    faCaretDown,
    faCaretUp,
    faUpRightFromSquare,
    faMaximize,
    faMinimize,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import Image from "next/image";
import dynamic from "next/dynamic";
import sanitize from "@/utils/sanitize";
import dp from "@/utils/dp";
import Link from "next/link";
import ago from "@/utils/ago";
import useWindowSize from "@/hooks/useWindowSize";

const CommentBox = dynamic(() => import("@/components/CommentBox"), {
    ssr: false,
});

const Comment = ({ comment, isPage, depth }: any) => {
    const { isLoggedIn } = useAuth();
    const [cm, setCm] = useState(comment);
    const { width } = useWindowSize();
    const { data: user } = useSWR(
        () => (comment?.user ? `u/${comment.user}` : null),
        fetcher(1000 * 60 * 5)
    );
    // 0 = no vote, 1 = upvote, -1 = downvote
    const { data, mutate } = useSWR(
        () => (comment?.id ? `cm/${comment.id}/vote` : null),
        fetcher(1000)
    );
    const { vote, upvotes, downvotes } = useMemo(() => data || {}, [data]);
    const { data: replies } = useSWR(
        comment?.id ? `cm/${comment.id}/replies` : null,
        fetcher()
    );
    const [commentBox, setCommentBox] = useState(false);
    const [showReplies, setShowReplies] = useState(isPage && depth < 3);
    const [expanded, setExpanded] = useState(depth < 4);
    const [mounted, setMounted] = useState(false);
    const p = usePost();
    const post_id = comment?.post ;

    const upvote = async () => {
        p(`cm/${comment.id}/upvote`, {})
            .then(() => {
                mutate();
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const downvote = async () => {
        p(`cm/${comment.id}/downvote`, {})
            .then(() => {
                mutate();
            })
            .catch((e) => {
                console.log(e);
            });
    };

    const toggleComment = () => {
        if (expanded) {
            setExpanded(false);
            setCommentBox(false);
            setShowReplies(false);
        } else {
            setExpanded(true);
        }
    };

    const toggleCommentBox = () => {
        setCommentBox(!commentBox);
    };

    const toggleReplies = () => {
        setShowReplies(!showReplies);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        setCm((c: any) => ({
            ...c,
            upvotes,
            downvotes,
        }));
    }, [upvotes, downvotes]);

    return (
        <> {isPage ? <Link href={`/p/${post_id}`}>Go to post</Link> : null}
        <div className="flex w-full mt-4 h-full bg-gray-100">
            <div className="flex flex-col items-center justify-start w-12 mr-4 bg-gray-200">
                <div className="flex flex-col items-center justify-center max-h-24 my-4 h-full">
                    <span className="cursor-pointer group" onClick={upvote}>
                        <FontAwesomeIcon
                            size="lg"
                            icon={faCaretUp}
                            className={`group-hover:text-rose-400 scale-x-125 ${
                                vote === 1 ? "text-rose-600" : ""
                            }`}
                        />
                    </span>
                    <span className="text-lg md:text-xl font-bold text-gray-500">
                        {cm.upvotes - cm.downvotes}
                    </span>
                    <span className="cursor-pointer group" onClick={downvote}>
                        <FontAwesomeIcon
                            size="lg"
                            icon={faCaretDown}
                            className={`group-hover:text-rose-400 scale-x-125 ${
                                vote === -1 ? "text-rose-600" : ""
                            }`}
                        />
                    </span>
                </div>
            </div>
            <div className="flex flex-col w-full">
                <div className="flex flex-row w-full items-center">
                    <Image
                        className="inline object-cover rounded-full mt-2 mr-4"
                        src={dp(user?.display_pic)}
                        width={40}
                        height={40}
                        alt="dp"
                    />
                    <h2 className="text-lg font-bold">u/{user?.username}</h2>
                </div>
                <div className="flex flex-col w-auto justify-between items-stretch">
                    <div className="flex flex-row relative">
                        {expanded ? null : (
                            // fade out
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-gray-200 to-transparent" />
                        )}
                        <div
                            className={`w-full pr-4 ${
                                expanded ? "h-full" : "hidden"
                            }`}
                            dangerouslySetInnerHTML={{
                                __html: mounted
                                    ? sanitize(comment.content)
                                    : "",
                            }}
                        />
                    </div>
                    <div className="flex flex-row items-center justify-start w-full py-1">
                        {isLoggedIn && (
                            <span
                                className="text-md text-gray-500 cursor-pointer mx-4"
                                onClick={toggleCommentBox}
                            >
                                comment
                            </span>
                        )}
                        <span
                            className={`text-md text-gray-500 cursor-pointer mx-4
                            ${width < 768 && depth > 5 ? "hidden" : ""}
                            `}
                            onClick={toggleReplies}
                        >
                            replies - {replies?.length}
                        </span>
                        <span className="text-md text-gray-500 cursor-pointer mx-4">
                            <FontAwesomeIcon
                                icon={expanded ? faMinimize : faMaximize}
                                className={`text-gray-500 cursor-pointer ${
                                    width < 768 && depth > 3 ? "hidden" : ""
                                }`}
                                onClick={toggleComment}
                                title="expand"
                            />
                        </span>
                        <Link
                            href={`/cm/${comment.id}`}
                            className="text-md text-gray-500 cursor-pointer mx-4"
                        >
                            <FontAwesomeIcon
                                icon={faUpRightFromSquare}
                                className="text-gray-500 cursor-pointer"
                                title="open in new tab"
                            />
                        </Link>
                    </div>
                    <div className="flex flex-col w-full">
                        {commentBox && isLoggedIn && (
                            <div className="border-l-2 border-gray-400 pl-4">
                                <CommentBox
                                    post_id={post_id}
                                    comment_id={comment.id}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col w-full">
                        {showReplies &&
                            replies?.map((reply: any) => (
                                <Comment
                                    key={reply.id}
                                    comment={reply}
                                    depth={depth + 1}
                                />
                            ))}
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Comment;
