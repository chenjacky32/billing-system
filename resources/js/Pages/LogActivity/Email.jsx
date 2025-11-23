import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    Typography,
    CardBody,
    Button,
    Breadcrumbs,
} from "@material-tailwind/react";
import { router } from "@inertiajs/react";
import { useState, useEffect } from "react";
import moment from "moment";
import Pagination from "@/Components/Pagination";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomSelect from "@/Components/CustomSelect";
import InputSearch from "@/Components/InputSearch";
import PageHeader from "@/Components/PageHeader";
import { TypeStatus } from "@/utils/constant";
import { truncateText } from "@/utils/helper";

const TABLE_HEAD = [
    "Id Log",
    "Waktu Dikirim",
    "Email Penerima",
    "Subjek Email",
    "Jenis Email",
    "Status",
    "Id-Billing",
    "Pesan Error",
];

const Email = ({ data, auth, errors, filters }) => {
    const [search, setSearch] = useState("");
    const [emailStatus, setEmailStatus] = useState("");

    function getStatusColor(status) {
        switch (status) {
            case "sent":
                return "bg-green-500"; // Green background for success status
            default:
                return "bg-red-500"; // Default background color
        }
    }

    const applyFilters = () => {
        router.get(
            route(route().current()),
            {
                search: search,
                status: emailStatus,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const applyClearFilters = () => {
        setSearch("");
        setEmailStatus(null);

        setTimeout(() => {
            router.get(
                route(route().current()),
                {
                    search: "",
                    status: null,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }, 0);
    };

    const handleInputChange = (value, type) => {
        if (type === "search") {
            setSearch(value);
        } else if (type === "status") {
            setStatus(value);
        }
    };

    function getPaginationUrl(baseUrl, searchQuery, statusQuery) {
        let url = baseUrl;
        const params = [];

        if (searchQuery) {
            params.push(`search=${encodeURIComponent(searchQuery)}`);
        }
        if (statusQuery) {
            params.push(`status=${encodeURIComponent(statusQuery)}`);
        }

        // Check if baseUrl already has a query parameter
        if (baseUrl.includes("?")) {
            url += "&" + params.join("&");
        } else {
            url += "?" + params.join("&");
        }

        return url;
    }

    useEffect(() => {
        setSearch(filters.search || "");
        setEmailStatus(filters.status || null);
    }, [filters]);

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Log Pengiriman Email
                </h2>
            }
        >
            <Head title="Log Pengiriman Email" />
            <div className="py-12">
                <div className="w-full mx-auto max-w-1xl sm:px-6 lg:px-8">
                    <Breadcrumbs className="ml-[-0.9rem] w-96 bg-transparent">
                        <Link
                            href={route("dashboard")}
                            className="opacity-60 text-primaryHover "
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={route("emailLogActivity.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Log Pengiriman Email
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                showSearch={false}
                                showAddButton={false}
                                title={"Log Aktivitas Pengiriman Email"}
                                description={
                                    "Informasi Data Log Aktivitas Pengiriman Email"
                                }
                            />

                            <div className="flex flex-row flex-wrap justify-start w-full">
                                <div className="mr-4 w-[21rem] mt-5 tablet:w-full">
                                    <InputSearch
                                        label="Cari Penerima / Subjek Email"
                                        searchValue={search}
                                        handleSearch={(event) =>
                                            handleInputChange(
                                                event.target.value,
                                                "search"
                                            )
                                        }
                                    />
                                </div>

                                <div className="mr-4 w-[21rem] mt-5 tablet:w-full">
                                    <CustomSelect
                                        id="status"
                                        title="Status"
                                        value={emailStatus}
                                        options={TypeStatus}
                                        onChange={(selectedValue) =>
                                            setEmailStatus(selectedValue)
                                        }
                                        variant="labelAsValue"
                                    />
                                </div>
                            </div>
                            <div className="w-[21rem] flex flex-row gap-4 mt-5 tablet:w-full ">
                                <Button
                                    className="w-full bg-white tablet:w-full tablet:mr-4 border-primary text-primary"
                                    variant="outlined"
                                    onClick={applyFilters}
                                >
                                    Filter
                                </Button>
                                <Button
                                    className="w-full text-red-400 bg-white border-red-400 tablet:w-full tablet:mr-4"
                                    variant="outlined"
                                    onClick={applyClearFilters}
                                >
                                    Clear
                                </Button>
                            </div>

                            <CardBody className="px-0">
                                <div className="w-full overflow-auto">
                                    <table className="w-full mt-4 text-left border-collapse table-auto mobile:mt-0 min-w-max tablet-rounded">
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
                                            {data.data.map(
                                                (
                                                    {
                                                        id,
                                                        sent_at,
                                                        recipient_email,
                                                        subject,
                                                        email_type,
                                                        status,
                                                        billing_id,
                                                        error_message,
                                                    },
                                                    index
                                                ) => {
                                                    const isLast =
                                                        index ===
                                                        data.data.length - 1;
                                                    const classes = isLast
                                                        ? "pl-4"
                                                        : "pl-4 border-b border-blue-gray-50";

                                                    return (
                                                        <tr
                                                            key={id}
                                                            className="text-black transition duration-300 bg-primary/15 hover:bg-primary/5"
                                                        >
                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-normal capitalize"
                                                                    >
                                                                        {id ??
                                                                            "-"}
                                                                    </Typography>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-normal capitalize"
                                                                    >
                                                                        {moment(
                                                                            sent_at
                                                                        ).format(
                                                                            "DD MMMM YYYY, HH:mm [WIB]"
                                                                        ) ??
                                                                            "-"}
                                                                    </Typography>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-normal capitalize"
                                                                    >
                                                                        {recipient_email ??
                                                                            "-"}
                                                                    </Typography>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-normal capitalize"
                                                                    >
                                                                        {truncateText(
                                                                            subject,
                                                                            18
                                                                        ) ??
                                                                            "-"}
                                                                    </Typography>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-bold capitalize"
                                                                    >
                                                                        {email_type ??
                                                                            "-"}
                                                                    </Typography>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className={`font-bold capitalize  ${getStatusColor(
                                                                            status
                                                                        )} text-white rounded-2xl w-20 flex justify-center`}
                                                                    >
                                                                        {status}
                                                                    </Typography>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-normal capitalize"
                                                                    >
                                                                        {
                                                                            billing_id
                                                                        }
                                                                    </Typography>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-normal capitalize"
                                                                    >
                                                                        <div className="flex items-center justify-center w-full h-10 overflow-hidden rounded-md">
                                                                            {error_message
                                                                                ? error_message
                                                                                : "-"}
                                                                        </div>
                                                                    </Typography>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardBody>
                            <Pagination
                                current_page={data.current_page}
                                last_page={data.last_page}
                                prev_page_url={data.prev_page_url}
                                next_page_url={data.next_page_url}
                                search={filters.search}
                                status={filters.status}
                                getPaginationUrl={(baseUrl) =>
                                    getPaginationUrl(
                                        baseUrl,
                                        filters.search,
                                        filters.status
                                    )
                                }
                            />
                        </Card>
                    </div>
                </div>
            </div>

            <ToastContainer />
        </AuthenticatedLayout>
    );
};

export default Email;
