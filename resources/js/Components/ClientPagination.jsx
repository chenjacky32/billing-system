import React from "react";
import { Button, CardFooter, Typography } from "@material-tailwind/react";

export default function ClientPagination({
    currentPage,
    totalPages,
    onPageChange,
}) {
    return (
        <CardFooter className="flex items-center justify-between p-4 border-t border-blue-gray-50">
            <Typography variant="small" className="font-extrabold text-primary">
                Page {currentPage} of {totalPages}
            </Typography>
            <div className="flex gap-2">
                {currentPage === 1 ? null : (
                    <Button
                        variant="outlined"
                        size="md"
                        className="border-primary text-primary"
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                )}

                {currentPage === totalPages ? null : (
                    <Button
                        variant="filled"
                        size="md"
                        className="w-28 h-[2.6rem] bg-primary text-white"
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                )}
            </div>
        </CardFooter>
    );
}
