import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    Typography,
    CardBody,
    Breadcrumbs,
    Select,
    Option,
    Button,
} from "@material-tailwind/react";
import CustomDatePicker from "@/Components/CustomDatePicker";
import InputSearch from "@/Components/InputSearch";
import CustomSelect from "@/Components/CustomSelect";
import { router } from "@inertiajs/react";
import { useState } from "react";
import moment from "moment";
import Pagination from "@/Components/Pagination";
import PageHeader from "@/Components/PageHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputLabel from "@/Components/InputLabel";
import BillingRow from "@/Components/BillingRow";
import CustomInput from "@/Components/CustomInput";
import { TypeBilling } from "@/utils/constant";
import dayjs from "dayjs";

const TABLE_HEAD = [
    "No Unit",
    "Nama Pemilik",
    "Tower",
    "Tipe Unit",
    "Periode",
    "Jenis Tagihan",
    "Biaya Tagihan",
    "Denda",
    "Tanggal Tagihan Dibuat",
    "Tanggal Jatuh Tempo",
    "Total Tagihan",
    "Tanggal Pembayaran",
    "Status Pembayaran",
];

export default function Billing({
    auth,
    errors,
    data,
    filters,
    ownerId,
    ownerName,
}) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [period, setPeriod] = useState(null);
    const [billingType, setBillingType] = useState(null);
    // const [fromDate, setFromDate] = useState("");
    // const [untilDate, setUntilDate] = useState("");
    // console.log(data.data);

    const handleStatusChange = (value) => {
        setStatus(value);
    };

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
        // Construct the query parameters including status, from_date, and until_date
        const queryParams = {
            status: status,
            period: period,
            billingType: billingType,
            // from_date: fromDate,
            // until_date: untilDate,
        };

        // Make the API request to filter the data based on the queryParams
        router.get(route(route().current(), { id: ownerId }), queryParams, {
            preserveState: true,
            replace: true,
        });
    };

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

    const applyClearFilters = () => {
        setStatus(null);
        setPeriod(null);
        setBillingType(null);
        setTimeout(() => {
            router.get(
                route(route().current(), { id: ownerId }),
                {
                    status: null,
                    period: null,
                    billingType: null,
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
        }, 0);
    };

    function getPaginationUrl(
        baseUrl,
        statusQuery,
        periodQuery,
        billingTypeQuery
        // fromDateQuery,
        // untilDateQuery
    ) {
        let url = baseUrl;
        const params = [];

        if (periodQuery) {
            params.push(`period=${encodeURIComponent(periodQuery)}`);
        }

        if (statusQuery) {
            params.push(`status=${encodeURIComponent(statusQuery)}`);
        }

        if (billingTypeQuery) {
            params.push(`billingType=${encodeURIComponent(billingTypeQuery)}`);
        }
        // if (fromDateQuery) {
        //     params.push(`from_date=${encodeURIComponent(fromDateQuery)}`);
        // }

        // if (untilDateQuery) {
        //     params.push(`until_date=${encodeURIComponent(untilDateQuery)}`);
        // }

        // Check if baseUrl already has a query parameter
        if (baseUrl.includes("?")) {
            url += "&" + params.join("&");
        } else {
            url += "?" + params.join("&");
        }

        return url;
    }

    const Name = ownerName;

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Billing History
                </h2>
            }
        >
            <Head title="Billing History" />

            <div className="py-12">
                <div className="w-full mx-auto max-w-1xl sm:px-6 lg:px-8">
                    <Breadcrumbs className="ml-[-0.9rem] w-[50rem] mobile:w-full bg-transparent">
                        <Link
                            href={route("dashboard")}
                            className="opacity-60 text-primaryHover "
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={route("owner.report.index")}
                            className="font-bold opacity-60 text-primary"
                        >
                            Unit Owner Report
                        </Link>
                        <Link
                            href={route("owner.report.show", {
                                id: ownerId,
                            })}
                            className="font-bold opacity-100 text-primary"
                        >
                            {Name}'s Billing History
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                // handleSearch={(event) =>
                                //     handleInputChange(
                                //         event.target.value,
                                //         "search"
                                //     )
                                // }
                                showInput={false}
                                title={`${Name}'s Billing History`}
                                description={`Informasi Data Billing ${Name}`}
                                buttonLabel={"Tambah Billing"}
                                addRoute={"billing.add"}
                                label="Cari Nama Unit Owner"
                                hasFilter={true}
                                showSearch={false}
                                showAddButton={false}
                            />
                            {/* <div className="mt-5">
                                <div className="flex flex-wrap ">
                                    <div className="w-[21rem] mr-4 tablet:w-full">
                                        <InputLabel>
                                            Status Pembyaran
                                        </InputLabel>
                                        <Select
                                            id="status"
                                            color="blue"
                                            value={status}
                                            onChange={(e) => setStatus(e)}
                                        >
                                            <Option value="">
                                                Status Pembayaran
                                            </Option>
                                            <Option value="Pending">
                                                Pending
                                            </Option>
                                            <Option value="Success">
                                                Success
                                            </Option>
                                            <Option value="Cancel">
                                                Cancel
                                            </Option>
                                        </Select>
                                    </div>
                                    <div className="mr-4 w-52 tablet:w-full tablet:mt-5">
                                        <InputLabel>Dari Tanggal</InputLabel>
                                        <CustomInput
                                            id="from_date"
                                            onChange={(e) =>
                                                setFromDate(e.target.value)
                                            } // Directly set the value
                                            className=""
                                            type="date"
                                        />
                                    </div>
                                    <div className="mr-4 w-52 tablet:w-full tablet:mt-5">
                                        <InputLabel>Sampai Tanggal</InputLabel>
                                        <CustomInput
                                            id="until_date"
                                            onChange={(e) =>
                                                setUntilDate(e.target.value)
                                            } // Directly set the value
                                            className=""
                                            type="date"
                                        />
                                    </div>
                                </div>
                                <div className="tablet:mr-4">
                                    <div className="mt-2 text-sm font-extrabold text-red-500 mobile:text-xs">
                                        **Harap isi semua filter di atas untuk
                                        melakukan filter data
                                    </div>
                                    <Button
                                        className="w-[49rem] mt-4 tablet:w-full tablet:mr-96 bg-white border-primary text-primary"
                                        variant="outlined"
                                        onClick={applyFilters}
                                    >
                                        Filter
                                    </Button>
                                </div>
                            </div>
                             */}
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
                                        <CustomSelect
                                            id="billing_type"
                                            title="Jenis Tagihan"
                                            value={billingType}
                                            options={TypeBilling}
                                            onChange={(selectedValue) =>
                                                setBillingType(selectedValue)
                                            }
                                            variant="labelAsValue"
                                        />
                                    </div>
                                    <div className="mr-4 w-[21rem] mt-5 tablet:w-full">
                                        <Select
                                            id="status"
                                            color="blue"
                                            label="Status Pembayaran"
                                            value={status}
                                            onChange={(e) => setStatus(e)}
                                        >
                                            <Option value="">
                                                Status Pembayaran
                                            </Option>
                                            <Option value="Pending">
                                                Pending
                                            </Option>
                                            <Option value="Success">
                                                Success
                                            </Option>
                                            <Option value="Cancel">
                                                Cancel
                                            </Option>
                                        </Select>
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
                                        {data.data && data.data.length > 0 ? (
                                            data.data.map(
                                                (
                                                    {
                                                        id,
                                                        residence,
                                                        tower,
                                                        billing_type,
                                                        period,
                                                        billing_fee,
                                                        status,
                                                        billing_date,
                                                        due_date,
                                                        fine,
                                                        paid_date,
                                                    },
                                                    index
                                                ) => {
                                                    const isLast =
                                                        index ===
                                                        data.length - 1;
                                                    const classes = isLast
                                                        ? "pl-4 py-2"
                                                        : "pl-4 py-2 border-b border-blue-gray-150";

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
                                                                        {
                                                                            residence.roomNo
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
                                                                        {
                                                                            residence
                                                                                .user
                                                                                .fullname
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
                                                                        {
                                                                            tower.tower_name
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
                                                                        {
                                                                            residence
                                                                                .apartmentTypeData
                                                                                .name
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
                                                                            billing_fee +
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
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal"
                                                                >
                                                                    {paid_date ? (
                                                                        moment(
                                                                            paid_date
                                                                        ).format(
                                                                            "LL"
                                                                        )
                                                                    ) : (
                                                                        <span className="font-bold text-red-500">
                                                                            BELUM
                                                                            ADA
                                                                            PEMBAYARAN
                                                                        </span>
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
                                            )
                                        ) : (
                                            <tr>
                                                <td
                                                    colSpan={TABLE_HEAD.length}
                                                    className="py-4 text-center"
                                                >
                                                    Belum Terdapat Transaksi
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardBody>
                            <Pagination
                                current_page={data.current_page}
                                last_page={data.last_page}
                                prev_page_url={data.prev_page_url}
                                next_page_url={data.next_page_url}
                                status={filters.status} // Pass the status filter to the Pagination component
                                from_date={filters.from_date} // Pass the from_date filter to the Pagination component
                                until_date={filters.until_date}
                                getPaginationUrl={(baseUrl) =>
                                    getPaginationUrl(
                                        baseUrl,
                                        filters.search,
                                        filters.status,
                                        filters.period,
                                        filters.billingType
                                        // filters.from_date,
                                        // filters.until_date
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
