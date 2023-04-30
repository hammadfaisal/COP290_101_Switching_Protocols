import { useEffect, useState, useRef, useContext, useMemo } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Main from "@/components/Main";
import consts from "@/consts";
import Button from "@/components/Button";
import { fetcher, usePost } from "@/hooks/useApi";
import Link from "next/link";
import { MsgDispatchContext } from "@/context/message";
import useJoined from "@/hooks/useJoined";
import sanitize from "@/utils/sanitize";
import ago from "@/utils/ago";
import Head from "next/head";
import PostFeed from "@/components/PostFeed";

interface Props {
    posts: any[];
    pages: number;
    community: any;
}

const CommunityPage = ({ posts, pages, community }: Props) => {
    const router = useRouter();
    const { name } = router.query;
    const [page, setPage] = useState<number>(0);
    const msgDispatch = useContext(MsgDispatchContext);
    const [pageCount, setPageCount] = useState<number>(pages);
    const [postss, setPosts] = useState<any>(posts);
    const joined = useJoined();
    const [hasJoined, setHasJoined] = useState(false);
    const pageChangedRef = useRef(false);
    const [mounted, setMounted] = useState(false);
    const fetchh = fetcher(1000 * 60);
    const post = usePost();

    useEffect(() => {
        if (joined && joined.some((c: any) => c.id === community.id)) {
            setHasJoined(true);
        }
    }, [joined, community.id]);

    useEffect(() => {
        fetchh(`c/${community.id}/posts/${page}`).then((data) => {
            setPosts(data.posts);
            setPageCount(data.pages);
        });
    }, [community.id, fetchh, page]);

    const changePage = (page: number) => () => {
        if (page < 0 || page >= pageCount) return;
        setPage(page);
        pageChangedRef.current = true;
    };

    const joinOrLeave = (x: string) => {
        post(`c/${x}`, {
            id: community.id,
        })
            .then((res) => {
                if (res.status !== 200) {
                    msgDispatch(res.data.error);
                }
            })
            .catch((err) => {
                msgDispatch(err.message);
            });
    };

    const join = () => {
        joinOrLeave("join");
        setHasJoined(true);
        msgDispatch(`joined c/${community.name}`);
    };

    const leave = () => {
        joinOrLeave("leave");
        setHasJoined(false);
        msgDispatch(`left c/${community.name}`);
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <Main>
            <Head>
                <title>c/{name}</title>
            </Head>
            <Navbar search />
            <div className="flex flex-col w-full px-4 mx-auto my-12">
                <h1 className="text-2xl md:text-3xl font-bold">c/{name}</h1>
                <div className="flex my-8 md:w-1/2 mx-auto">
                    <Link
                        href={`/p/create?community=${community.id}`}
                        className="text-rose-700 my-4 mx-auto text-bold text-lg md:text-xl"
                    >
                        create post
                    </Link>
                    <span
                        className="text-rose-700 my-4 mx-auto text-bold text-lg md:text-xl cursor-pointer"
                        onClick={hasJoined ? leave : join}
                    >
                        {hasJoined ? "leave" : "join"}
                    </span>
                </div>
                {postss.map((post: any) => (
                    <PostFeed key={post.id} post={post} />
                ))}
                <div className="flex flex-row items-center justify-center">
                    <Button
                        onClick={changePage(page - 1)}
                        disabled={page === 0}
                    >
                        Previous
                    </Button>
                    <span className="mx-4">
                        {page + 1} / {pageCount}
                    </span>
                    <Button
                        onClick={changePage(page + 1)}
                        disabled={page === pageCount - 1}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </Main>
    );
};

export default CommunityPage;

export async function getServerSideProps({ params }: any) {
    const { name } = params;
    const res1 = await fetch(`${consts.API_URL}/c/get/${name}`);

    if (!res1.ok) {
        return {
            notFound: true,
        };
    }

    const community = await res1.json();
    const res2 = await fetch(`${consts.API_URL}/c/${community.id}/posts/0`);

    const { posts, pages } = await res2.json();
    return {
        props: {
            posts,
            pages,
            community,
        },
    };
}
