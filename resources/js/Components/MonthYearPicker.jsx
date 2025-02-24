import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const MonthYearPicker = ({
    className,
    startDate,
    onChange,
    dateFormat = "MM/yyyy",
    placeholderText,
    errors,
    // value,
}) => {
    return (
        <div className="flex flex-col w-full mr-4 ">
            <div className={`lg:w-full ml-0 flex ${className}`}>
                <DatePicker
                    className={className}
                    selected={startDate}
                    onChange={onChange}
                    dateFormat={dateFormat}
                    showMonthYearPicker
                    placeholderText={placeholderText}
                />
            </div>
            {errors && (
                <p className="mt-3 ml-0 text-sm text-red-500">{errors}</p>
            )}
        </div>
    );
};

export default MonthYearPicker;
