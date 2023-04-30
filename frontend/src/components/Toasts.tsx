import { Msg } from "@/context/message";

const Toast = ({ message }: Msg) => {
    return (
        <div
            className="pointer-events-auto mx-auto w-72 p-4 max-w-full rounded-lg bg-white bg-clip-padding text-lg shadow-lg"
            role="alert"
        >
            <div className="flex items-center space-x-3">
                <p>{message}</p>
            </div>
        </div>
    );
};

interface IToastsProps {
    messages: Msg[];
}

const Toasts = ({ messages }: IToastsProps) => {
    return (
        <div className="fixed bottom-4 left-4 z-50">
            {messages.map((m, i) => (
                <Toast key={m.id} message={m.message} id={m.id} />
            ))}
        </div>
    );
};

export default Toasts;
