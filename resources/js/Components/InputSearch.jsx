import React from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";
import { Input } from "@material-tailwind/react";

const InputSearch = ({ label, searchValue, handleSearch }) => {
    return (
        <Input
            label={label}
            value={searchValue}
            onChange={handleSearch}
            icon={<MagnifyingGlassIcon className="w-5 h-5 " />}
        />
    );
};

export default InputSearch;
