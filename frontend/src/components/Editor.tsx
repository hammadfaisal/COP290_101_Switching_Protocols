import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

interface EditorProps {
    content: string;
    setContent: (content: string) => void;
}

const Editor = (props: EditorProps) => {
    return (
        <div className="w-full">
            <ReactQuill
                value={props.content}
                onChange={props.setContent}
                className="w-full"
            />
        </div>
    );
};

export default Editor;