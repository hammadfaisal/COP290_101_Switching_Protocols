import Main from "@/components/Main";
import Navbar from "@/components/Navbar";
import PostFeed from "@/components/PostFeed";
import Comment from "@/components/Comment";
import { useRouter } from "next/router";
import useSWR from "swr";
import Head from "next/head";

const Search = () => {
    const router = useRouter();
    const { q } = router.query;
    const { data: results } = useSWR(q ? `/search-posts?q=${q}` : null);

    return (
        <Main>
            <Head>
                <title>Search</title>
            </Head>
            <Navbar search />
            <div className="flex flex-col items-start justify-center w-11/12">
                {results?.posts?.length
                    ? results?.posts?.map((post: any) => (
                          <PostFeed key={post.id} post={post} />
                      ))
                    : null}
                {results?.comments?.length
                    ? results?.comments?.map((comment: any) => (
                        <Comment key={comment.id} comment={comment} />
                      ))
                    : null}
            </div>
        </Main>
    );
};

export default Search;
