import React from "react";
import { getImageIdUrl, getImageUserUrl } from "@/utils/helper";

const ImageItems = ({
    imagePath,
    alt,
    loading = "lazy",
    variant = "base",
    errorMesssageImg = "Gambar tidak tersedia",
    imageType = "id" | "user",
}) => {
    const [src, setSrc] = React.useState(null);
    const [isError, setIsError] = React.useState(false);

    React.useEffect(() => {
        let isMounted = true;
        let objectUrl;

        if (imageType === "id") {
            getImageIdUrl(imagePath)
                .then((url) => {
                    if (isMounted && url) {
                        objectUrl = url;
                        setSrc(url);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }

        if (imageType === "user") {
            getImageUserUrl(imagePath)
                .then((url) => {
                    if (isMounted && url) {
                        objectUrl = url;
                        setSrc(url);
                    }
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }

        return () => {
            isMounted = false;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [imagePath]);

    const imgVariant = {
        base: (
            <img
                src={src}
                alt={alt}
                loading={loading}
                className="object-cover h-[50px] rounded-md"
            />
        ),
        preview: (
            <div
                className={`flex justify-center items-center w-full rounded-md h-64 overflow-hidden 
                    bg-gray-200`}
            >
                {!isError && src ? (
                    <img
                        src={src}
                        alt={alt}
                        className="object-contain w-full h-full"
                        loading={loading}
                    />
                ) : (
                    <div className="flex justify-center">
                        <span className="h-full text-base font-normal text-gray-700">
                            {errorMesssageImg}
                        </span>
                    </div>
                )}
            </div>
        ),
    };

    return imgVariant[variant] || imgVariant.base;
};

export default ImageItems;
