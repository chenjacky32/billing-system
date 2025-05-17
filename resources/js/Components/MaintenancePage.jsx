import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { Button } from "@material-tailwind/react";
import { router } from "@inertiajs/react";

const MaintenancePage = ({ namePages }) => {
    return (
        <div className="flex flex-col items-center justify-center h-screen p-4 text-center bg-gray-100">
            <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-2xl">
                <div className="flex justify-center mb-4">
                    <ExclamationTriangleIcon className="w-12 h-12 text-yellow-500" />
                </div>
                <h1 className="mb-2 text-2xl font-bold text-gray-800">
                    {`Halaman ${namePages}, Masih Dalam Pengembangan`}
                </h1>
                <p className="mb-6 text-gray-600">
                    Maaf, halaman ini sedang dalam proses pengembangan. Silakan
                    kembali lagi nanti.
                </p>
                <Button
                    onClick={() => router.visit(route("dashboard"))}
                    className="w-full text-white bg-primary"
                >
                    Kembali
                </Button>
            </div>
        </div>
    );
};

export default MaintenancePage;
