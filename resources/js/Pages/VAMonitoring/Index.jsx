import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage, useForm } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Card,
    Typography,
    CardBody,
    IconButton,
    Tooltip,
    Breadcrumbs,
} from "@material-tailwind/react";
import {
    FolderPlusIcon,
    TrashIcon,
    NoSymbolIcon,
} from "@heroicons/react/24/solid";
import PageHeader from "@/Components/PageHeader";
import moment from "moment";
import Pagination from "@/Components/Pagination";
import CountdownTimer from "@/Components/CountdownTimer";

const TABLE_HEAD = [
    "No",
    "Nama Apartemen",
    "Periode Tagihan",
    "Jenis Tagihan",
    "Jumlah Pembayaran",
    "Tanggal Pembayaran",
    "Id-Biling",
    "Id-TRX",
    "No Virtual Account",
    "Nama Virtual Account",
    "Status Pembayaran",
    "Tanggal dibuat",
    "Tanggal Expired",
    "Status VA",
    "Sisa Waktu",
    "Expiredkan VA",
    "Hapus VA",
];

const VAMonitoring = ({ auth, error, vaData, pagination, filters }) => {
    const [search, setSearch] = React.useState("");
    const { flash } = usePage().props;
    const { data, setData, patch, post, processing, errors } = useForm({
        id: "",
    });

    function handleExpired(id) {
        patch(`/va-monitoring/${id}/update`);
    }

    function handleDelete(id) {
        post(`/va-monitoring/${id}/delete`);
    }

    const buttonIcon = <FolderPlusIcon strokeWidth={2} className="w-4 h-4" />;

    function getStatusColor(status) {
        switch (status) {
            case 0:
                return "bg-orange-500";
            case 1:
                return "bg-green-500";
            default:
                return "bg-red-500"; // Default background color
        }
    }

    function getExpiredColor(expired) {
        switch (expired) {
            case 1:
                return "bg-red-500";
            default:
                return "bg-green-500";
        }
    }

    function getPaginationUrl(baseUrl, searchQuery) {
        let url = baseUrl;
        const params = [];

        if (searchQuery) {
            params.push(`search=${encodeURIComponent(searchQuery)}`);
        }

        if (baseUrl.includes("?")) {
            url += "&" + params.join("&");
        } else {
            url += "?" + params.join("&");
        }

        return url;
    }

    function handleInputChange(value, type) {
        if (type === "search") {
            setSearch(value);
        }

        router.get(
            route(route().current()),
            {
                search: type === "search" ? value : search,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    React.useEffect(() => {
        if (flash.message) {
            toast.success(flash.message);
        }

        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.message, flash.error]);

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    VA Monitoring
                </h2>
            }
        >
            <Head title="VA - Monitoring" />

            <div className="py-12">
                <div className="w-full mx-auto max-w-1xl sm:px-6 lg:px-8">
                    <Breadcrumbs className="ml-[-0.9rem] w-96 bg-transparent">
                        <Link
                            href={route("dashboard")}
                            className="opacity-60 text-primaryHover"
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={route("VAMonitoring.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            VA Monitoring
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12">
                            <PageHeader
                                showAddButton={false}
                                title={"VA Monitoring List"}
                                description={
                                    "Informasi VA Pembayaran yang sudah dibuat oleh User"
                                }
                                showInput={true}
                                searchValue={search}
                                handleSearch={(event) =>
                                    handleInputChange(
                                        event.target.value,
                                        "search"
                                    )
                                }
                                icon={buttonIcon}
                                label="Cari Nomor VA"
                            />
                            <CardBody className="px-0 overflow-scroll">
                                <table
                                    className="w-full mt-4 text-left border table-auto mobile:mt-0 min-w-max "
                                    style={{
                                        borderRadius: "10px",
                                        overflow: "hidden",
                                    }}
                                >
                                    <thead>
                                        <tr>
                                            {TABLE_HEAD.map((head, index) => (
                                                <th
                                                    key={index}
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
                                        {vaData.map(
                                            (
                                                {
                                                    id,
                                                    billingId,
                                                    apartmentName,
                                                    period,
                                                    paidDate,
                                                    billingType,
                                                    status,
                                                    responseMessage,
                                                    total_amount,
                                                    transactionDate,
                                                    virtualAccount,
                                                    isExpired,
                                                },
                                                index
                                            ) => {
                                                const isLast =
                                                    index === vaData.length - 1;
                                                const classes = isLast
                                                    ? "p-4"
                                                    : "pl-4 border-b border-blue-gray-150";

                                                const {
                                                    virtualAccountData: {
                                                        expiredDate,
                                                        trxId,
                                                        virtualAccountName,
                                                    },
                                                } = JSON.parse(responseMessage);

                                                return (
                                                    <tr
                                                        key={id}
                                                        className="text-black transition duration-300 group bg-primary/15 hover:bg-primary/5"
                                                    >
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {index + 1}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {
                                                                        apartmentName
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {period
                                                                        ? moment(
                                                                              period
                                                                          ).format(
                                                                              "MMMM, YYYY"
                                                                          )
                                                                        : "-"}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {
                                                                        billingType
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-bold capitalize"
                                                                >
                                                                    {new Intl.NumberFormat(
                                                                        "id-ID",
                                                                        {
                                                                            style: "currency",
                                                                            currency:
                                                                                "IDR",
                                                                        }
                                                                    ).format(
                                                                        total_amount
                                                                    )}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {paidDate ===
                                                                    null
                                                                        ? "-"
                                                                        : moment(
                                                                              paidDate
                                                                          ).format(
                                                                              "LL"
                                                                          )}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {billingId}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-medium capitalize"
                                                                >
                                                                    {trxId}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-medium underline capitalize"
                                                                >
                                                                    {
                                                                        virtualAccount
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {
                                                                        virtualAccountName
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className={`font-normal capitalize ${getStatusColor(
                                                                        status
                                                                    )} text-white rounded-2xl font-semibold w-20 flex justify-center`}
                                                                >
                                                                    {status ===
                                                                    0
                                                                        ? "Pending"
                                                                        : "Success"}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {moment(
                                                                        transactionDate
                                                                    ).format(
                                                                        "DD MMMM YYYY, HH:mm [WIB]"
                                                                    )}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {moment(
                                                                        expiredDate
                                                                    ).format(
                                                                        "DD MMMM YYYY, HH:mm [WIB]"
                                                                    )}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className={`font-normal capitalize ${getExpiredColor(
                                                                        isExpired
                                                                    )} text-white rounded-2xl font-semibold w-20 flex justify-center`}
                                                                >
                                                                    {isExpired ===
                                                                    1
                                                                        ? "Expired"
                                                                        : "Active"}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="paragraph"
                                                                    className="font-bold text-red-500 capitalize"
                                                                >
                                                                    {status ===
                                                                    1 ? (
                                                                        "-"
                                                                    ) : (
                                                                        <CountdownTimer
                                                                            startDate={
                                                                                transactionDate
                                                                            }
                                                                            endDate={
                                                                                expiredDate
                                                                            }
                                                                        />
                                                                    )}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            {status === 1 ? (
                                                                "-"
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        handleExpired(
                                                                            id
                                                                        )
                                                                    }
                                                                >
                                                                    <Tooltip
                                                                        content="Expired VA"
                                                                        animate={{
                                                                            mount: {
                                                                                scale: 1,
                                                                                y: 0,
                                                                            },
                                                                            unmount:
                                                                                {
                                                                                    scale: 0,
                                                                                    y: 25,
                                                                                },
                                                                        }}
                                                                        className="bg-teal-500"
                                                                    >
                                                                        <IconButton
                                                                            color="teal"
                                                                            variant="filled"
                                                                        >
                                                                            <NoSymbolIcon className="w-4 h-4" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </button>
                                                            )}
                                                        </td>

                                                        <td className={classes}>
                                                            {status === 1 ? (
                                                                "-"
                                                            ) : (
                                                                <button
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            id
                                                                        )
                                                                    }
                                                                >
                                                                    <Tooltip
                                                                        content="Delete VA"
                                                                        animate={{
                                                                            mount: {
                                                                                scale: 1,
                                                                                y: 0,
                                                                            },
                                                                            unmount:
                                                                                {
                                                                                    scale: 0,
                                                                                    y: 25,
                                                                                },
                                                                        }}
                                                                        className="bg-red-600"
                                                                    >
                                                                        <IconButton
                                                                            color="red"
                                                                            variant="filled"
                                                                        >
                                                                            <TrashIcon className="w-4 h-4" />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </CardBody>
                            <Pagination
                                search={filters.search}
                                current_page={pagination.current_page}
                                last_page={pagination.last_page}
                                next_page_url={pagination.next_page_url}
                                prev_page_url={pagination.prev_page_url}
                                getPaginationUrl={(baseUrl) =>
                                    getPaginationUrl(baseUrl, filters.search)
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

export default VAMonitoring;
