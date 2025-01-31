import { Button, CardFooter, Typography } from "@material-tailwind/react";
import React from "react";
import { Link } from "@inertiajs/react";

export default function Pagination({
    current_page,
    last_page,
    prev_page_url,
    next_page_url,
    search,
    getPaginationUrl,
}) {
    return (
        <CardFooter className="flex items-center justify-between p-4 border-t border-blue-gray-50">
            <Typography
                variant="small"
                // color="blue-gray"
                className="font-extrabold text-primary"
            >
                Page {current_page} of {last_page}
            </Typography>
            <div className="flex gap-2">
                {prev_page_url && (
                    <Link href={getPaginationUrl(prev_page_url, search)}>
                        <Button
                            variant="outlined"
                            size="md"
                            className="border-primary text-primary"
                        >
                            Previous
                        </Button>
                    </Link>
                )}
                {next_page_url && (
                    <Link href={getPaginationUrl(next_page_url, search)}>
                        <Button
                            variant="filled"
                            size="md"
                            className="w-28 h-[2.6rem] bg-primary text-white"
                        >
                            Next
                        </Button>
                    </Link>
                )}
            </div>
        </CardFooter>
    );
}
