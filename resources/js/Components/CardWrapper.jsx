import React from "react";

const CardWrapper = ({ children }) => {
    return (
        <div className="flex flex-row w-full gap-4 my-8 tablet:flex-col tablet:my-4 tablet:items-center">
            {children}
        </div>
    );
};

export default CardWrapper;
