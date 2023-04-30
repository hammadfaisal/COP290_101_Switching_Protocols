import { useCallback, useState, useEffect } from "react";

const useWindowSize = () => {
    const isClient = typeof window === "object";

    const getSize = useCallback(() => {
        return {
            width: isClient ? window.innerWidth : 768,
            height: isClient ? window.innerHeight : 768,
        };
    }, [isClient]);

    const [windowSize, setWindowSize] = useState(getSize);

    useEffect(() => {
        if (!isClient) {
            return;
        }

        const handleResize = () => {
            setWindowSize(getSize());
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [getSize, isClient]); // Empty array ensures that effect is only run on mount and unmount

    return windowSize;
};

export default useWindowSize;
