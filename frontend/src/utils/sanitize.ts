import sanitizeHtml from "sanitize-html";

export default function sanitize(html: string) {
    return sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
        allowedAttributes: {
            ...sanitizeHtml.defaults.allowedAttributes,
            img: ["src", "alt"],
        },
        allowedSchemes: ["data", "http", "https"],
    });
}
