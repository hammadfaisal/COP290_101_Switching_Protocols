import Comment from "@/components/Comment";
import consts from "@/consts";
import Head from "next/head";
import Main from "@/components/Main";
import Navbar from "@/components/Navbar";

const CommentPage = ({ comment }: any) => {
    let title = "No Comment"
    if (typeof document !== "undefined") {
        const htmlNode = document.createElement("div");
        htmlNode.innerHTML = comment.content;
        title = htmlNode.textContent?.slice(0, 50) || "";
    }
    return (
        <>
            <Head>
                <title>{title}</title>
            </Head>
            <Main>
                <Navbar search />
                <hr className="my-4 bg-transparent" />
                <Comment comment={comment}  isPage depth={0} />
            </Main>
        </>
    );
    
};

export const getServerSideProps = async (context: any) => {
    const res = await fetch(`${consts.API_URL}/cm/${context.params.id}/info`);
    const comment = await res.json();
    return {
        props: {
            comment,
        },
    };
};

export default CommentPage;
