import React from "react";
import { DotLoader } from "react-spinners";
import { useLoading } from "../Context/LoadingContext";

const LoadingProgress = () => {
    const loading = useLoading();

    if (!loading) return null;

    return (
        <div className="fixed inset-0 w-screen h-screen flex justify-center items-center z-[9999]">
            <DotLoader color="#4B5563" size={60} speedMultiplier={1} />
        </div>
    );
};

export default LoadingProgress;
