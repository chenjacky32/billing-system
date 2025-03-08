import React from "react";

const ImageContainer = ({ imageUrl, altText, errorMesssageImg }) => {
    const [hasError, setHasError] = React.useState(false);

    const handleImageError = () => {
        setHasError(true);
    };

    return (
        <div
            className={`flex justify-center items-center w-full rounded-md h-64 overflow-hidden 
                bg-gray-200`}
        >
            {!hasError && imageUrl ? (
                <img
                    src={imageUrl}
                    alt={altText}
                    className="object-contain w-full h-full"
                    onError={handleImageError}
                />
            ) : (
                <div className="flex justify-center">
                    <span className="h-full text-base font-normal text-gray-700">
                        {errorMesssageImg}
                    </span>
                </div>
            )}
        </div>
    );
};

export default ImageContainer;
