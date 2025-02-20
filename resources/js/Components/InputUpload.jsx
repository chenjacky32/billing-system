import React, { useState } from "react";
import { XCircleIcon, CloudArrowUpIcon } from "@heroicons/react/24/solid";

const InputUpload = ({ className, onChange, error, currentImage }) => {
    const [dragActive, setDragActive] = useState(false);
    const [fileName, setFileName] = useState("");
    const [preview, setPreview] = useState(
        currentImage ? `/storage/public/apartment/${currentImage}` : null
    );

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file) => {
        // Validate file type
        if (!file.type.match("image.*")) {
            alert("Please upload an image file");
            return;
        }

        // Validate file size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            alert("File size should be less than 2MB");
            return;
        }

        setFileName(file.name);
        onChange?.(file);

        // Create preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const removeFile = () => {
        setFileName("");
        setPreview(null);
        onChange?.(null);
    };

    return (
        <div className={`flex flex-col w-full ${className}`}>
            <label
                htmlFor="file_input"
                className="block mb-2 text-sm font-medium text-gray-700"
            >
                Upload Your Logo
            </label>

            {preview ? (
                <div className="relative w-full mb-4">
                    <img
                        src={preview}
                        alt="Preview"
                        className="object-cover w-full h-full rounded-lg"
                    />
                    <button
                        type="button"
                        onClick={removeFile}
                        className="absolute bg-white rounded-full top-2 right-2"
                    >
                        <XCircleIcon className="w-6 h-6 text-red-500 hover:text-red-600 stroke-white" />
                    </button>
                </div>
            ) : (
                <div
                    className={`relative w-full h-32 border-2 border-dashed rounded-lg transition-all
                        ${
                            dragActive
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-300 bg-gray-50"
                        }
                        ${error ? "mt-3 ml-0 text-sm text-red-500" : ""}
                        hover:border-blue-400 hover:bg-blue-50`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        id="file_input"
                        className="absolute inset-0 z-10 w-full h-full opacity-0 cursor-pointer"
                        onChange={handleChange}
                        accept="image/png,image/jpeg,image/jpg"
                    />
                    <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                        <CloudArrowUpIcon
                            className={`w-8 h-8 mb-2
                                ${
                                    dragActive
                                        ? "text-blue-500"
                                        : "text-gray-400"
                                }`}
                        />
                        <span
                            className={`text-sm font-medium ${
                                dragActive ? "text-blue-500" : "text-gray-600"
                            }`}
                        >
                            {fileName
                                ? fileName
                                : "Drop files here or click to upload"}
                        </span>
                        <span className="mt-1 text-sm text-gray-500">
                            PNG or JPG (MAX. 2MB)
                        </span>
                    </div>
                </div>
            )}

            {error && <p className="mt-3 ml-0 text-sm text-red-500">{error}</p>}
        </div>
    );
};

export default InputUpload;
