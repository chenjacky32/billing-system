import React from "react";
import { Select, Option } from "@material-tailwind/react";

const CustomSelect = ({
    id,
    title = "",
    value,
    options,
    onChange,
    variant = "default",
}) => {
    return (
        <Select
            id={id}
            label={title}
            color="blue"
            value={value}
            onChange={(selectedValue) => {
                onChange(selectedValue);
            }}
        >
            {options.map((opt, index) => (
                <Option
                    key={index}
                    value={variant === "labelAsValue" ? opt : opt.value}
                >
                    {variant === "labelAsValue" ? opt : opt.label}
                </Option>
            ))}
        </Select>
    );
};

export default CustomSelect;
