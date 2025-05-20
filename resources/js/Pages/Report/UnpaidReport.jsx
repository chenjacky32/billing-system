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
import PageHeader from "@/Components/PageHeader";
import { ToastContainer } from "react-toastify";
import CustomDatePicker from "@/Components/CustomDatePicker";
import "react-toastify/dist/ReactToastify.css";
import CustomSelect from "@/Components/CustomSelect";
import InputSearch from "@/Components/InputSearch";
import dayjs from "dayjs";
import { TypeBilling, stickyColumnStyles } from "@/utils/constant";

const TABLE_HEAD = [
    "No Unit",
    "Nama Pemilik",
    "Tower",
    "Tipe Unit",
    "Periode",
    "Jenis Tagihan",
    "Biaya Tagihan",
    "Denda",
    "Total Tagihan",
    "Tanggal Tagihan Dibuat",
    "Tanggal Jatuh Tempo",
    "Status Pembayaran",
    // "Dibuat Oleh",
];

// const stickyColumnStyles = {
//     baseClass: "sticky-col",
//     background: "bg-blue-50",
//     positions: ["0px", "160px", "320px", "480px"],
// };

export default function UnpaidReport({
    auth,
    errors,
    data,
    filters,
    totalBillingIsUnpaid,
    totalCountPending,
    totalFine,
    towerData,
    apartmentType,
}) {
    const [search, setSearch] = useState("");
    const [period, setPeriod] = useState(null);
    const [tower, setTower] = useState("");
    const [billingType, setBillingType] = useState(null);
    const [unitType, setUnitType] = useState(null);

    // console.log(data.data);
    // console.log("period", period);
    // console.log("tower", tower);
    // console.log("billingType", billingType);
    // console.log("unitType", unitType);

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
                towerId: tower,
                unitType: unitType,
                billingType: billingType,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const applyClearFilters = () => {
        setSearch("");
        setBillingType(null);
        setUnitType(null);
        setTower(null);
        setPeriod(null);
        setTimeout(() => {
            router.get(
                route(route().current()),
                {
                    search: "",
                    period: null,
                    towerId: null,
                    unitType: null,
                    billingType: null,
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

        // router.get(
        //     route(route().current()),
        //     {
        //         search: type === "search" ? value : search,
        //         period: period,
        //     },
        //     {
        //         preserveState: true,
        //         replace: true,
        //     }
        // );
    };

    function getPaginationUrl(
        baseUrl,
        searchQuery,
        periodQuery,
        towerQuery,
        unitTypeQuery,
        billingTypeQuery
    ) {
        let url = baseUrl;
        const params = [];

        if (searchQuery) {
            params.push(`search=${encodeURIComponent(searchQuery)}`);
        }
        if (periodQuery) {
            params.push(`period=${encodeURIComponent(periodQuery)}`);
        }
        if (towerQuery) {
            params.push(`towerId=${encodeURIComponent(towerQuery)}`);
        }
        if (unitTypeQuery) {
            params.push(`unitType=${encodeURIComponent(unitTypeQuery)}`);
        }
        if (billingTypeQuery) {
            params.push(`billingType=${encodeURIComponent(billingTypeQuery)}`);
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
        setPeriod(filters.period || null);
        setTower(Number(filters.towerId) || null);
        setBillingType(filters.billingType || null);
        setUnitType(Number(filters.unitType) || null);
    }, [filters]);

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
                    Unpaid Billing
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
                            href={route("billing.unpaid.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Unpaid Billing
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                showInput={false}
                                title={"Unpaid Billing"}
                                description={
                                    "Informasi Data Billing Yang Belum Lunas Dan Belum Jatuh Tempo"
                                }
                                buttonLabel={"Tambah Billing"}
                                // icon={buttonIcon}
                                addRoute={"billing.add"}
                                label="Cari Nama Unit Owner"
                                hasFilter={true}
                                showAddButton={false}
                                showCard={true}
                                labelBilling={
                                    "Total Tagihan Yang Belum Jatuh Tempo"
                                }
                                labelPaidorUnpaid={
                                    "Jumlah Pembayaran Yang Belum Jatuh Tempo"
                                }
                                labelFine={"Total Denda"}
                                countFine={totalFine}
                                isFine={true}
                                countBilling={totalBillingIsUnpaid}
                                countPaidorUnpaid={totalCountPending}
                            />
                            <div className="mt-5">
                                <div className="flex flex-row flex-wrap items-center justify-start w-full">
                                    <div className="w-full mr-4 tablet:w-full tablet:mt-5">
                                        <CustomDatePicker
                                            value={
                                                period ? dayjs(period) : null
                                            }
                                            onChange={handleChangePeriod}
                                            placeholderText={
                                                "Pilih Periode Bulan"
                                            }
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-row flex-wrap justify-start w-full">
                                    <div className="mr-4 w-[21rem] mt-5 tablet:w-full">
                                        <InputSearch
                                            label="Cari Nama Unit Owner / Nomor Unit"
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
                                            id="tower"
                                            value={tower}
                                            title="Tipe Tower"
                                            options={towerData}
                                            onChange={(selectedValue) =>
                                                setTower(selectedValue)
                                            }
                                        />
                                    </div>

                                    <div className="mr-4 w-[21rem] mt-5 tablet:w-full">
                                        <CustomSelect
                                            id="Unit Type"
                                            value={unitType}
                                            title="Tipe Unit"
                                            options={apartmentType}
                                            onChange={(selectedValue) =>
                                                setUnitType(selectedValue)
                                            }
                                        />
                                    </div>

                                    <div className="mr-4 w-[21rem] mt-5 tablet:w-full">
                                        <CustomSelect
                                            id="billing_type"
                                            title="Tipe Billing"
                                            value={billingType}
                                            options={TypeBilling}
                                            onChange={(selectedValue) =>
                                                setBillingType(selectedValue)
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
                            </div>
                            <CardBody className="px-0">
                                <div className="w-full overflow-auto">
                                    <table className="w-full mt-4 text-left border-collapse table-auto mobile:mt-0 min-w-max tablet-rounded">
                                        <thead>
                                            <tr>
                                                {TABLE_HEAD.map(
                                                    (head, index) => (
                                                        <th
                                                            key={head}
                                                            className={`text-left py-4 pl-4 border-y bg-primary ${
                                                                index < 4
                                                                    ? "sticky-col"
                                                                    : ""
                                                            }`}
                                                            style={{
                                                                left:
                                                                    index < 4
                                                                        ? `${
                                                                              index *
                                                                              160
                                                                          }px`
                                                                        : "auto",
                                                            }}
                                                        >
                                                            <Typography
                                                                variant="small"
                                                                className="font-bold text-textColor"
                                                            >
                                                                {head}
                                                            </Typography>
                                                        </th>
                                                    )
                                                )}
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
                                                        total_amount,
                                                        fine,
                                                        tower,
                                                        period,
                                                        status,
                                                        billing_date,
                                                        due_date,
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
                                                            <td
                                                                className={`${classes} ${stickyColumnStyles.baseClass} ${stickyColumnStyles.background} 
                                                                `}
                                                                style={{
                                                                    left: stickyColumnStyles
                                                                        .positions[0],
                                                                }}
                                                            >
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

                                                            <td
                                                                className={`${classes} ${stickyColumnStyles.baseClass} ${stickyColumnStyles.background}`}
                                                                style={{
                                                                    left: stickyColumnStyles
                                                                        .positions[1],
                                                                }}
                                                            >
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

                                                            <td
                                                                className={`${classes} ${stickyColumnStyles.baseClass} ${stickyColumnStyles.background} `}
                                                                style={{
                                                                    left: stickyColumnStyles
                                                                        .positions[2],
                                                                }}
                                                            >
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

                                                            <td
                                                                className={`${classes} ${stickyColumnStyles.baseClass} ${stickyColumnStyles.background} `}
                                                                style={{
                                                                    left: stickyColumnStyles
                                                                        .positions[3],
                                                                }}
                                                            >
                                                                <div className="flex flex-col">
                                                                    <Typography
                                                                        variant="small"
                                                                        className="font-normal capitalize"
                                                                    >
                                                                        {residence?.apartmentTypeData
                                                                            ? residence
                                                                                  .apartmentTypeData
                                                                                  .name
                                                                            : "-"}
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
                                                                            billing_type
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
                                                                        {new Intl.NumberFormat(
                                                                            "id-ID",
                                                                            {
                                                                                style: "currency",
                                                                                currency:
                                                                                    "IDR",
                                                                            }
                                                                        ).format(
                                                                            fine
                                                                        )}
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
                                                                        className="font-semibold capitalize"
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
                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal"
                                                                >
                                                                    {moment(
                                                                        billing_date
                                                                    ).format(
                                                                        "LL"
                                                                    )}
                                                                </Typography>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal"
                                                                >
                                                                    {moment(
                                                                        due_date
                                                                    ).format(
                                                                        "LL"
                                                                    )}
                                                                </Typography>
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
                                status={filters.status} // Pass the status filter to the Pagination component
                                getPaginationUrl={(baseUrl) =>
                                    getPaginationUrl(
                                        baseUrl,
                                        filters.search,
                                        filters.period,
                                        filters.towerId,
                                        filters.unitType,
                                        filters.billingType
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
