import * as React from "react";
import dayjs from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";

const currentYear = dayjs();

export default function CustomDatePicker({
    className,
    value,
    onChange,
    placeholderText,
    errors,
}) {
    return (
        <div className="flex flex-col w-full mr-4 ">
            <div className={`lg:w-full ml-0 flex ${className}`}>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                        value={value}
                        onChange={onChange}
                        label={placeholderText}
                        maxDate={currentYear}
                        openTo="year"
                        views={["year", "month"]}
                        yearsOrder="desc"
                        sx={{
                            minWidth: 250,
                            width: "100%",
                            borderRadius: "0.5rem", // rounded-lg
                            "& .MuiOutlinedInput-root": {
                                "&:hover fieldset": {
                                    borderColor: "#7e4efb",
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: "#7e4efb",
                                },
                            },
                        }}
                    />
                </LocalizationProvider>
            </div>
            {errors && (
                <p className="mt-3 ml-0 text-sm text-red-500">{errors}</p>
            )}
        </div>
    );
}
