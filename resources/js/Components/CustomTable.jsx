import { Link } from "@inertiajs/react";
import { CardBody, Typography } from "@material-tailwind/react";
import moment from "moment";
import React from "react";
const TABLE_HEAD = ["Nama Owner", "Jenis Tagihan", "Biaya Tagihan"];
export default function CustomTable({ data, title, route }) {
    const currentMonthYear = moment().format("MMMM, YYYY");
    return (
        <>
            <div className="w-full h-full">
                <h1 className="p-2 font-bold text-center text-primary">
                    {title}
                </h1>
                <h1 className="font-bold text-center text-primary">
                    Periode {currentMonthYear}
                </h1>
                <CardBody className="w-full px-0 overflow-scroll h-60">
                    <table
                        className="w-full mt-0 text-left border table-auto mobile:mt-0 min-w-max "
                        style={{
                            borderRadius: "10px",
                            overflow: "hidden",
                        }}
                    >
                        <thead>
                            <tr>
                                {TABLE_HEAD.map((head) => (
                                    <th
                                        key={head}
                                        className="py-4 pl-4 border-y bg-primary"
                                    >
                                        <Typography
                                            variant="small"
                                            className="font-bold text-textColor"
                                        >
                                            {head}
                                        </Typography>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length > 0 ? (
                                data.map(
                                    (
                                        {
                                            id,
                                            owner,
                                            billing_type,
                                            billing_fee,
                                        },
                                        index
                                    ) => {
                                        const isLast =
                                            index === data.length - 1;
                                        const classes = isLast
                                            ? "pl-4 py-2"
                                            : "pl-4 py-2 border-b border-blue-gray-150";

                                        return (
                                            <tr
                                                key={id}
                                                className="text-black transition duration-300 bg-primary/15 hover:bg-primary/5"
                                            >
                                                <td className={classes}>
                                                    <div className="flex flex-col">
                                                        <Typography
                                                            variant="small"
                                                            className="font-normal capitalize"
                                                        >
                                                            {owner?.owner_name}
                                                        </Typography>
                                                    </div>
                                                </td>

                                                <td className={classes}>
                                                    <div className="flex flex-col">
                                                        <Typography
                                                            variant="small"
                                                            className="font-normal capitalize"
                                                        >
                                                            {billing_type}
                                                        </Typography>
                                                    </div>
                                                </td>

                                                <td className={classes}>
                                                    <div className="flex flex-col">
                                                        <Typography
                                                            variant="small"
                                                            className="font-normal capitalize"
                                                        >
                                                            {new Intl.NumberFormat(
                                                                "id-ID",
                                                                {
                                                                    style: "currency",
                                                                    currency:
                                                                        "IDR",
                                                                }
                                                            ).format(
                                                                billing_fee
                                                            )}
                                                        </Typography>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    }
                                )
                            ) : (
                                <tr>
                                    <td
                                        colSpan="3"
                                        className="py-2 pl-4 text-center"
                                    >
                                        No data available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardBody>
                <Link
                    href={route}
                    className="font-bold opacity-100 text-primary"
                >
                    View More
                </Link>
            </div>
        </>
    );
}
