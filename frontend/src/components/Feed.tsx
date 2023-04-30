import React, { useCallback, useEffect, useState } from "react";
import PostFeed from "./PostFeed";
import { fetcher, useGet } from "@/hooks/useApi";
import useSWR from "swr";
import { Sort } from "@/types/sort";
import useAuth from "@/hooks/useAuth";

const Feed = ({ sort, home }: any) => {
    const auth = useAuth();
    const { data: h } = useSWR(
        auth.isLoggedIn ? "me/feed" : null,
        fetcher(1000 * 60 * 5)
    );
    const { data: trending } = useSWR("trending", fetcher(1000 * 60 * 5));
    const [posts, setPosts] = useState<any>(home ? h : trending);

    useEffect(() => {
        if (home) {
            setPosts(h);
        } else {
            setPosts(trending);
        }
    }, [home, h, trending]);

    if (home) {
        if (!auth.isLoggedIn) return <p>login to see your feed</p>;
    }

    return (
        <div className="w-full">
            {posts &&
                posts.sort((a: any, b: any) => {
                    let bcreat = new Date(b.time_created);
                    let acreat = new Date(a.time_created);
                    if (sort == Sort.hot) {
                        return (a.upvotes + a.downvotes) / (Date.now() - +acreat) >
                            (b.upvotes + b.downvotes) / (Date.now() - +bcreat)
                            ? -1
                            : 1;
                    }
                    if (sort == Sort.new) {
                        return +acreat > +bcreat ? -1 : 1;
                    }
                    if (sort == Sort.top) {
                        const av = a.upvotes - a.downvotes;
                        const bv = b.upvotes - b.downvotes;
                        return bv - av;
                    }
                    if (sort == Sort.old) {
                        return +acreat > +bcreat ? 1 : -1;
                    }
                }).map((post: any) => (
                    <PostFeed key={post.id} post={post} />
                ))}
        </div>
    );
};

export default Feed;
