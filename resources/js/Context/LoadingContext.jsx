import { createContext, useContext, useState, useEffect } from "react";
import { router } from "@inertiajs/react";

const LoadingContext = createContext(false);

export function LoadingProvider({ children }) {
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        router.on("start", () => setLoading(true));
        router.on("finish", () => setLoading(false));
        router.on("error", () => setLoading(false));
        router.on("invalid", () => setLoading(false));
    }, []);

    return (
        <LoadingContext.Provider value={loading}>
            {children}
        </LoadingContext.Provider>
    );
}

export function useLoading() {
    return useContext(LoadingContext);
}
