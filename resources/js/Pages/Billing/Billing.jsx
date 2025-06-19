import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";
import CustomDatePicker from "@/Components/CustomDatePicker";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    Typography,
    CardBody,
    Tooltip,
    Button,
    Breadcrumbs,
    Select,
    Option,
    DialogHeader,
    DialogBody,
    DialogFooter,
    IconButton,
} from "@material-tailwind/react";
import ModalCustom from "@/Components/ModalCustom";
import {
    FolderPlusIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/solid";
import CustomInput from "@/Components/CustomInput";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import moment from "moment";
import Pagination from "@/Components/Pagination";
import PageHeader from "@/Components/PageHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { XMarkIcon, DocumentArrowDownIcon } from "@heroicons/react/24/outline";
import CustomSelect from "@/Components/CustomSelect";
import dayjs from "dayjs";
import { TypeBilling, stickyColumnStyles } from "@/utils/constant";

const TABLE_HEAD = [
    "No Unit",
    "Nama Pemilik",
    "Tower",
    "Tipe Unit",
    "Periode",
    "Jenis Tagihan",
    "Denda",
    "Biaya Tagihan",
    "Tanggal Tagihan Dibuat",
    "Tanggal Jatuh Tempo",
    "Total Tagihan",
    "Status Pembayaran",
    "Tanggal dibayar",
    "Dibuat Oleh",
    "Edit",
    "Delete",
];

export default function Billing({
    auth,
    errors,
    data,
    filters,
    apartmentId,
    towerData,
    unitTypeData,
    apartmentType,
}) {
    const role = auth.user.role;

    const { flash } = usePage().props;
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [period, setPeriod] = useState(null);
    const [tower, setTower] = useState(null);
    const [billingType, setBillingType] = useState(null);
    const [unitType, setUnitType] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [pendingEditId, setPendingEditId] = useState("");
    const [isLoading, setIsLoading] = useState(null);
    const [password, setPassword] = useState("");
    const [apartId, setApartId] = useState(
        role === "SUPER ADMIN" ? "" : apartmentId
    );

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
        router.get(
            route(route().current()),
            {
                search: search,
                period: period,
                towerId: tower,
                unitType: unitType,
                billingType: billingType,
                status: status,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const applyClearFilters = () => {
        setSearch("");
        setStatus("");
        setBillingType(null);
        setPeriod(null);
        setTower(null);
        setUnitType(null);
        setTimeout(() => {
            router.get(
                route(route().current()),
                {
                    search: "",
                    period: null,
                    towerId: null,
                    unitType: null,
                    billingType: null,
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

        // router.get(
        //     route(route().current()),
        //     {
        //         search: type === "search" ? value : search,
        //         status: type === "status" ? value : status,
        //     },
        //     {
        //         preserveState: true,
        //         replace: true,
        //     }
        // );
    };

    function handleSearch(event) {
        console.log(event.target.value);
        router.get(
            route(route().current()),
            { search: event.target.value },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function getPaginationUrl(
        baseUrl,
        searchQuery,
        statusQuery,
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
        if (statusQuery) {
            params.push(`status=${encodeURIComponent(statusQuery)}`);
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

    const buttonIcon = <FolderPlusIcon strokeWidth={2} className="w-4 h-4" />;

    useEffect(() => {
        setSearch(filters.search || "");
        setStatus(filters.status || "");
        setPeriod(filters.period || null);
        setTower(Number(filters.towerId) || null);
        setBillingType(filters.billingType || null);
        setUnitType(Number(filters.unitType) || null);
    }, [filters]);

    useEffect(() => {
        if (flash.message) {
            toast.success(flash.message);
        }
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.message, flash.error]);

    const handleDelete = (id) => {
        toast.info(
            <div className="p-4">
                <p>Apakah Anda yakin ingin menghapus data Billing ini?</p>
                <div className="flex justify-end mt-4">
                    <button
                        className="px-4 py-2 mr-2 text-white bg-red-500 rounded hover:bg-red-700"
                        onClick={() => deleteData(id)}
                    >
                        Ya
                    </button>
                    <button
                        className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-700"
                        onClick={() => toast.dismiss()}
                    >
                        Tidak
                    </button>
                </div>
            </div>,
            {
                icon: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                autoClose: false,
                hideProgressBar: true,
                position: "top-center",
            }
        );
    };

    const deleteData = (id) => {
        router.post(
            "/billing/delete",
            { id },
            {
                preserveScroll: true,
                preserveState: false,
                onFinish: () => toast.dismiss(),
            }
        );
    };

    const handleClickEdit = ({ id, apartId }) => {
        setPendingEditId(id);
        setApartId(apartId);
        setIsPasswordModalOpen(true);
        setPasswordError("");
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPendingEditId(null);
        setPassword("");
        setPasswordError("");
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading("verify-password");
        setPasswordError("");
        try {
            const response = await axios.post(route("resourceAccess.verify"), {
                password: password,
                apartmentId: apartId,
            });

            if (response.data.success) {
                const id = pendingEditId;

                router.visit(route("billing.edit", { id }), {
                    method: "get",
                    data: {
                        id: undefined,
                    },
                });
            } else {
                setPasswordError(response.data.errors?.password);
            }
        } catch (error) {
            if (error.response?.data?.errors?.password) {
                setPasswordError(error.response.data.errors.password);
            } else {
                setPasswordError("Something went wrong, please try again.");
            }
        } finally {
            setIsLoading(null);
        }
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

    const handleExport = () => {
        const params = new URLSearchParams({
            search: filters.search || "",
            status: filters.status || "",
            period: filters.period || "",
            towerId: filters.towerId || "",
            unitType: filters.unitType || "",
            billingType: filters.billingType || "",
        }).toString();
        window.location.href = route("billing.export") + "?" + params;
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Unit Owner
                </h2>
            }
        >
            <Head title="Billing List" />

            <div className="py-12">
                <div className="w-full mx-auto max-w-1xl sm:px-6 lg:px-8 ">
                    <Breadcrumbs className="ml-[-0.9rem] w-96 bg-transparent">
                        <Link
                            href={route("dashboard")}
                            className="opacity-60 text-primaryHover "
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={route("billing.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Billing
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                showInput={true}
                                searchValue={search}
                                handleSearch={(event) =>
                                    handleInputChange(
                                        event.target.value,
                                        "search"
                                    )
                                }
                                title={"Billing List"}
                                description={
                                    "Informasi Data Billing pada Masing-masing Unit Owner"
                                }
                                buttonLabel={"Tambah Billing"}
                                icon={buttonIcon}
                                addRoute={"billing.add"}
                                label="Cari Nama Unit Owner / Nomor Unit"
                                hasFilter={true}
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
                                    <div className="mr-4 w-[21rem] mt-5 tablet:w-full">
                                        <Select
                                            label="Status Pembayaran"
                                            id="status"
                                            color="blue"
                                            value={status}
                                            onChange={(value) =>
                                                handleInputChange(
                                                    value,
                                                    "status"
                                                )
                                            }
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
                                <div className="w-[21rem] flex flex-row gap-4 mt-5 tablet:w-full mobile:flex-col mobile:mr-5 ">
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
                                    <Button
                                        className="flex items-center justify-center w-full px-4 py-2 font-medium text-white transition-colors duration-200 bg-blue-500 border border-blue-600 rounded-md hover:bg-blue-600 tablet:w-full tablet:mr-4"
                                        variant="outlined"
                                        onClick={handleExport}
                                    >
                                        <DocumentArrowDownIcon class="h-6 w-6 text-white" />
                                        Export
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
                                                        owner,
                                                        apartment_id,
                                                        billing_type,
                                                        billing_fee,
                                                        period,
                                                        tower,
                                                        created_by,
                                                        status,
                                                        billing_date,
                                                        due_date,
                                                        paid_date,
                                                        residence,
                                                        fine,
                                                        total_amount,
                                                    },
                                                    index
                                                ) => {
                                                    const isLast =
                                                        index ===
                                                        data.data.length - 1;
                                                    const classes = isLast
                                                        ? "pl-4"
                                                        : "pl-4 border-b border-blue-gray-150";

                                                    return (
                                                        <tr
                                                            key={id}
                                                            className="text-black transition duration-300 group bg-primary/15 hover:bg-primary/5"
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
                                                                        {
                                                                            residence?.roomNo
                                                                        }
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
                                                                        {tower
                                                                            ? tower.tower_name
                                                                            : "-"}
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
                                                                        {residence
                                                                            ?.apartmentTypeData
                                                                            ?.name ??
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
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-semibold"
                                                                >
                                                                    {new Intl.NumberFormat(
                                                                        "id-ID",
                                                                        {
                                                                            style: "currency",
                                                                            currency:
                                                                                "IDR",
                                                                        }
                                                                    ).format(
                                                                        total_amount ??
                                                                            0
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

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal"
                                                                >
                                                                    {paid_date ===
                                                                    null
                                                                        ? "-"
                                                                        : moment(
                                                                              paid_date
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
                                                                    {
                                                                        created_by.name
                                                                    }
                                                                </Typography>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Tooltip
                                                                    content="Edit Billing"
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
                                                                    className="bg-green-600"
                                                                >
                                                                    {role ===
                                                                    "SUPER ADMIN" ? (
                                                                        <>
                                                                            <Link
                                                                                href={route(
                                                                                    "billing.edit",
                                                                                    {
                                                                                        id: id,
                                                                                    }
                                                                                )}
                                                                                method="get"
                                                                                data={{
                                                                                    id: undefined,
                                                                                }}
                                                                                as="button"
                                                                            >
                                                                                <IconButton color="green">
                                                                                    <PencilIcon className="w-4 h-4" />
                                                                                </IconButton>
                                                                            </Link>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Button
                                                                                size="md"
                                                                                variant="gradient"
                                                                                color="green"
                                                                                onClick={() =>
                                                                                    handleClickEdit(
                                                                                        {
                                                                                            id: id,
                                                                                            apartId:
                                                                                                apartment_id,
                                                                                        }
                                                                                    )
                                                                                }
                                                                            >
                                                                                <PencilIcon className="w-4 h-4" />
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </Tooltip>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Tooltip
                                                                    content="Delete Billing"
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
                                                                    <Button
                                                                        size="md"
                                                                        variant="gradient"
                                                                        color="red"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                id
                                                                            )
                                                                        }
                                                                    >
                                                                        <TrashIcon className="w-4 h-4" />
                                                                    </Button>
                                                                    {/* <Link
                                                                        href={route(
                                                                            "billing.delete",
                                                                            {
                                                                                id: id,
                                                                            }
                                                                        )}
                                                                        method="post"
                                                                        data={{
                                                                            id: undefined,
                                                                        }}
                                                                        as="button"
                                                                    >
                                                                        <IconButton color="red">
                                                                            <TrashIcon className="w-4 h-4" />
                                                                        </IconButton>
                                                                    </Link> */}
                                                                </Tooltip>
                                                            </td>
                                                        </tr>
                                                    );
                                                }
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                                {isPasswordModalOpen && (
                                    <ModalCustom
                                        isOpen={isPasswordModalOpen}
                                        onClose={() => {
                                            setIsPasswordModalOpen(false);
                                            setPendingEditId(null);
                                        }}
                                    >
                                        <DialogHeader className="relative block m-0">
                                            <PageHeader
                                                title={"Otorisasi Diperlukan !"}
                                                description={
                                                    "Silahkan masukkan kata sandi untuk melanjutkan proses Edit Billing."
                                                }
                                                showSearch={false}
                                            />
                                            <IconButton
                                                size="sm"
                                                variant="text"
                                                className="!absolute right-3.5 top-3.5"
                                                onClick={() => {
                                                    handleClosePasswordModal();
                                                }}
                                            >
                                                <XMarkIcon className="w-4 h-4 stroke-2" />
                                            </IconButton>
                                        </DialogHeader>
                                        <DialogBody className="pb-6 space-y-4">
                                            <form
                                                onSubmit={handlePasswordSubmit}
                                            >
                                                <div className="flex flex-col w-full">
                                                    <CustomInput
                                                        label="Password"
                                                        id="password"
                                                        type="password"
                                                        value={password}
                                                        onChange={(e) =>
                                                            setPassword(
                                                                e.target.value
                                                            )
                                                        }
                                                        className=""
                                                    />
                                                    {passwordError && (
                                                        <p className="mt-2 text-sm text-red-500">
                                                            {passwordError}
                                                        </p>
                                                    )}
                                                </div>
                                            </form>
                                        </DialogBody>
                                        <DialogFooter>
                                            <Button
                                                variant="filled"
                                                onClick={handlePasswordSubmit}
                                                className="ml-auto bg-primary"
                                                loading={
                                                    isLoading ===
                                                    "verify-password"
                                                }
                                            >
                                                Verify
                                            </Button>
                                        </DialogFooter>
                                    </ModalCustom>
                                )}
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
                                        filters.status,
                                        filters.period,
                                        filters.towerId,
                                        filters.unitType,
                                        filters.billing_type
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
