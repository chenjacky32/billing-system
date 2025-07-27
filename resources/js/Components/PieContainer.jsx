import React from "react";
import { Pie } from "react-chartjs-2";

const PieContainer = ({ children, name }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <h1 className="my-5 text-xl font-bold text-primary mobile:text-base">
                Okupansi {name}
            </h1>
            <div className="h-[30rem] w-[30rem] mobile:h-[15rem] mobile:w-[15rem] mb-10">
                {children}
            </div>
        </div>
    );
};

export default PieContainer;
