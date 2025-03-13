import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    Typography,
    CardBody,
    Button,
    Breadcrumbs,
} from "@material-tailwind/react";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import moment from "moment";
import Pagination from "@/Components/Pagination";
import PageHeader from "@/Components/PageHeader";
import { ToastContainer, toast } from "react-toastify";
import CustomDatePicker from "@/Components/CustomDatePicker";
import "react-toastify/dist/ReactToastify.css";
import dayjs from "dayjs";

const TABLE_HEAD = [
    "Nama Owner",
    "Nomor Room",
    "Apartemen",
    "Tower",
    "Tipe Unit",
    "Jenis Tagihan",
    "Periode",
    "Biaya Tagihan",
    "Tanggal Tagihan Dibayar",
    "Status Pembayaran",
    // "Dibuat Oleh",
];

export default function PaidReport({
    auth,
    errors,
    data,
    filters,
    totalBillingIsPaid,
    totalCountSuccess,
}) {
    const [search, setSearch] = useState("");
    const [period, setPeriod] = useState(null);
    console.log(search);
    console.log(period);
    console.log(data.data);
    console.log("period", period);
    console.log("search", search);

    function getStatusColor(status) {
        switch (status) {
            case "Pending":
                return "bg-orange-500"; // Yellow background for pending status
            case "Success":
                return "bg-green-500"; // Green background for success status
            case "Cancel":
                return "bg-red-500"; // Red background for cancel status
            default:
                return ""; // Default background color
        }
    }

    const applyFilters = () => {
        router.get(
            route(route().current()),
            {
                search: search,
                period: period,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const applyClearFilters = () => {
        setSearch("");
        setPeriod(null);
        applyFilters();
    };

    const handleInputChange = (value, type) => {
        if (type === "search") {
            setSearch(value);
        } else if (type === "status") {
            setStatus(value);
        }

        router.get(
            route(route().current()),
            {
                search: type === "search" ? value : search,
                period: period,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
    };

    function getPaginationUrl(baseUrl, searchQuery, periodQuery) {
        let url = baseUrl;
        const params = [];

        if (searchQuery) {
            params.push(`search=${encodeURIComponent(searchQuery)}`);
        }
        if (periodQuery) {
            params.push(`period=${encodeURIComponent(periodQuery)}`);
        }

        // Check if baseUrl already has a query parameter
        if (baseUrl.includes("?")) {
            url += "&" + params.join("&");
        } else {
            url += "?" + params.join("&");
        }

        return url;
    }

    function formattedDate(date) {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const handleChangePeriod = (value) => {
        const firstDate = value.date(1);
        setPeriod(formattedDate(firstDate.$d));
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Paid Billings
                </h2>
            }
        >
            <Head title="Billing List" />

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
                            href={route("billing.paid.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Paid Billing
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                searchValue={search}
                                handleSearch={(event) =>
                                    handleInputChange(
                                        event.target.value,
                                        "search"
                                    )
                                }
                                title={"Paid Billing"}
                                description={
                                    "Informasi Data Billing Yang Sudah Lunas"
                                }
                                buttonLabel={"Tambah Billing"}
                                // icon={buttonIcon}
                                addRoute={"billing.add"}
                                label="Cari Nama Unit Owner"
                                hasFilter={true}
                                showAddButton={false}
                                showCard={true}
                                labelBilling={"Total Tagihan Lunas"}
                                labelPaidorUnpaid={"Jumlah Pembayaran Lunas"}
                                countBilling={totalBillingIsPaid}
                                countPaidorUnpaid={totalCountSuccess}
                            />
                            <div className="mt-5">
                                <div className="flex flex-wrap ">
                                    <div className="mr-4 w-[21rem]  tablet:w-full tablet:mt-5">
                                        {/* <InputLabel>Sub Periode</InputLabel> */}
                                        <CustomDatePicker
                                            value={
                                                period ? dayjs(period) : null
                                            }
                                            onChange={handleChangePeriod}
                                            placeholderText={
                                                "Pilih Periode Bulan"
                                            }
                                        />
                                        <div className="w-[21rem] flex flex-row gap-4 mt-4 tablet:w-full">
                                            <Button
                                                className="w-full bg-white tablet:w-full border-primary text-primary"
                                                variant="outlined"
                                                onClick={applyFilters}
                                            >
                                                Filter
                                            </Button>
                                            <Button
                                                className="w-full text-red-400 bg-white border-red-400 tablet:w-full"
                                                variant="outlined"
                                                onClick={applyClearFilters}
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
                                                    billing_type,
                                                    billing_fee,
                                                    residence,
                                                    apartment,
                                                    period,
                                                    tower,
                                                    status,
                                                    paid_date,
                                                },
                                                index
                                            ) => {
                                                const isLast =
                                                    index ===
                                                    data.data.length - 1;
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
                                                                    {residence
                                                                        ?.user
                                                                        ?.fullname ??
                                                                        "-"}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {residence?.roomNo ??
                                                                        "-"}
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
                                                                        apartment.name
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
                                                                    {tower?.tower_name ??
                                                                        "-"}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {"-"}
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
                                                                        billing_type
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

                                                        {/* <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="font-normal"
                                                            >
                                                                {moment(
                                                                    billing_date
                                                                ).format("LL")}
                                                            </Typography>
                                                        </td> */}

                                                        <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="font-normal"
                                                            >
                                                                {moment(
                                                                    paid_date
                                                                ).format("LL")}
                                                            </Typography>
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

                                                        {/* <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="font-normal"
                                                            >
                                                                {
                                                                    created_by.name
                                                                }
                                                            </Typography>
                                                        </td> */}
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </CardBody>
                            <Pagination
                                current_page={data.current_page}
                                last_page={data.last_page}
                                prev_page_url={data.prev_page_url}
                                next_page_url={data.next_page_url}
                                search={filters.search}
                                period={filters.period}
                                status={filters.status} // Pass the status filter to the Pagination component
                                getPaginationUrl={(baseUrl) =>
                                    getPaginationUrl(
                                        baseUrl,
                                        filters.search,
                                        filters.period,
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
}
