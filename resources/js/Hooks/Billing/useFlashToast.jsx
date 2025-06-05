import { useEffect } from "react";
import { toast } from "react-toastify";

const useFlashToast = (flash) => {
    useEffect(() => {
        if (flash?.error) {
            toast.error(flash.error);
        }
    }, [flash?.error]);
};

export default useFlashToast;
