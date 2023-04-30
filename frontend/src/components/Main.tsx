import { Comfortaa } from "next/font/google";

const font = Comfortaa({ weight: "400", subsets: ["latin"] });

const Main = ({ children }: { children: React.ReactNode }) => {
    return (
        <main className={`h-screen w-full overflow-scroll ${font.className}`}>
            <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col">{children}</div>
        </main>
    );
};

export default Main;
