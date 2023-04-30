interface ClassesProps {
    classes?: string;
}

const Button = (
    props: React.DetailedHTMLProps<
        React.ButtonHTMLAttributes<HTMLButtonElement>,
        HTMLButtonElement
    > &
        ClassesProps
) => {
    return (
        <button
            className={`${props.classes} py-2 px-4 rounded-md bg-rose-800 text-white hover:bg-rose-900 transition-all w-36 mx-auto disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-rose-800`}
            {...props}
        />
    );
};

export default Button;
