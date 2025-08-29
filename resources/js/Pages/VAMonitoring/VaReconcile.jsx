import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Card,
    Typography,
    CardBody,
    Breadcrumbs,
    Button,
    Option,
    Select,
} from "@material-tailwind/react";
import { FolderPlusIcon } from "@heroicons/react/24/solid";
import PageHeader from "@/Components/PageHeader";
import CustomInput from "@/Components/CustomInput";
import InputLabel from "@/Components/InputLabel";
import { ApiService } from "@/service/ApiService";
import { NetworkEndpoint } from "@/service/ApiEndpoint";
import ClientPagination from "@/Components/ClientPagination";
import { formattedWithTimeZone } from "@/utils/helper";
import { Timezone } from "@/utils/constant";
import moment from "moment";
import CardWrapper from "@/Components/CardWrapper";
import CardTotals from "@/Components/CardTotals";

const TABLE_HEAD = [
    "No",
    "Id-TRX",
    "Id-Biling",
    "No Virtual Account",
    "Nama Virtual Account",
    "Jumlah Pembayaran",
    "Tanggal Transaksi",
    "Status Rekonsiliasi",
];

const VaReconcile = ({ auth, error, corpCode }) => {
    const [requestPayload, setRequestPayload] = React.useState({
        timezone: "+07:00",
        corp_code: "",
        start_date: "",
        start_time: "",
        end_time: "",
    });
    const [currentPage, setCurrentPage] = React.useState(1);
    const [reconsileVA, setReconsileVA] = React.useState([]);
    const [summary, setSummary] = React.useState([]);
    const [errors, setErrors] = React.useState({
        timezone: "",
        corp_code: "",
        start_date: "",
        start_time: "",
        end_time: "",
    });

    const itemPerPage = 10;
    const totalPages = Math.ceil(reconsileVA.length / itemPerPage);

    const paginatedData = reconsileVA.slice(
        (currentPage - 1) * itemPerPage,
        currentPage * itemPerPage
    );

    const handleCorpCodeChange = (value) => {
        setRequestPayload((prevState) => ({
            ...prevState,
            corp_code: value,
        }));
    };

    const handleTimezoneChange = (value) => {
        setRequestPayload((prevState) => ({
            ...prevState,
            timezone: value,
        }));
    };

    const handleSubmit = async (payload) => {
        setErrors({
            timezone: "",
            corp_code: "",
            start_date: "",
            start_time: "",
            end_time: "",
        });

        const finalPayload = {
            ...payload,
            start_time: formattedWithTimeZone(
                payload.start_time,
                payload.timezone
            ),
            end_time: formattedWithTimeZone(payload.end_time, payload.timezone),
            timezone: payload.timezone,
            corp_code: payload.corp_code,
        };
        try {
            const res = await getReconsileVA(finalPayload);

            if (res.statusCode == 200) {
                toast.success(res.message);
                setReconsileVA(res.data.details);
                setSummary(res.data.summary);
            }

            if (res.statusCode == 422 && res.errors) {
                Object.entries(res.errors).forEach(([field, messages]) => {
                    setErrors((prevErrors) => ({
                        ...prevErrors,
                        [field]: messages[0],
                    }));
                });

                toast.error("Validasi gagal. Periksa isian form.");
                return res;
            }
            return res;
        } catch (error) {
            toast.error("Terjadi Kesalahan Sistem. Silahkan Coba lagi.");
            return {
                statusCode: error?.response?.status || 500,
                message: error?.response?.data?.message || "Unknown error",
                errors: error?.response?.data?.errors || {},
            };
        }
    };

    const getReconsileVA = async (payload) => {
        const response = await ApiService.post(
            "",
            route(NetworkEndpoint.GET_RECONCILE_VA_TRANSACTION),
            payload
        );
        return response;
    };

    function getStatusColor(status) {
        switch (status) {
            case "Gagal diperbarui":
                return "bg-orange-500";
            case "Berhasil diperbarui":
                return "bg-green-500";
            case "Tidak ditemukan":
                return "bg-red-500";
            default:
                return "bg-gray-500";
        }
    }

    const buttonIcon = <FolderPlusIcon strokeWidth={2} className="w-4 h-4" />;

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Rekonsiliasi Pembayaran
                </h2>
            }
        >
            <Head title="Rekonsiliasi Pembayaran" />

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
                            href={route("VAMonitoring.reconcile")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Rekonsiliasi Pembayaran
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12">
                            <PageHeader
                                showAddButton={false}
                                showSearch={false}
                                title={" Rekonsiliasi Pembayaran Virtual Akun"}
                                description={
                                    "Rekonsiliasi Pembayaran Virtual Account dari Sistem BRI"
                                }
                                icon={buttonIcon}
                                label="Cari Nomor VA"
                            />

                            <div className="mt-5">
                                <div className="flex flex-wrap w-full">
                                    <div className="w-full mr-4 tablet:w-full tablet:mt-5">
                                        <InputLabel>Kode Corporate</InputLabel>
                                        <Select
                                            id="corp_code"
                                            color="blue"
                                            value={requestPayload.corp_code.toString()}
                                            onChange={handleCorpCodeChange}
                                        >
                                            {corpCode.map((items, index) => (
                                                <Option
                                                    key={index}
                                                    value={items.value}
                                                >
                                                    {items.label}
                                                </Option>
                                            ))}
                                        </Select>
                                        {errors.corp_code && (
                                            <p className="mt-3 ml-0 text-sm text-red-500">
                                                {errors.corp_code}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap w-full gap-5 mt-5 tablet:mt-0 tablet:gap-0">
                                    <div className="w-full mr-4 tablet:mt-5">
                                        <InputLabel>Zona Waktu</InputLabel>
                                        <Select
                                            id="timezone"
                                            color="blue"
                                            value={requestPayload.timezone.toString()}
                                            onChange={handleTimezoneChange}
                                        >
                                            {Timezone.map((items, index) => (
                                                <Option
                                                    key={index}
                                                    value={items.value}
                                                >
                                                    {items.label}
                                                </Option>
                                            ))}
                                        </Select>
                                        {errors.timezone && (
                                            <p className="mt-3 ml-0 text-sm text-red-500">
                                                {errors.timezone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-wrap w-full gap-5 mt-5 tablet:mt-0 tablet:gap-0">
                                    <div className="w-full mr-4 tablet:mt-5">
                                        <InputLabel>
                                            Tanggal Transaksi
                                        </InputLabel>
                                        <CustomInput
                                            value={requestPayload.start_date}
                                            onChange={(e) =>
                                                setRequestPayload(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        start_date:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            id="from_date"
                                            type="date"
                                        />
                                        {errors.start_date && (
                                            <p className="mt-3 ml-0 text-sm text-red-500">
                                                {errors.start_date}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-full mr-4 tablet:mt-5">
                                        <InputLabel>Mulai dari</InputLabel>
                                        <CustomInput
                                            id="start_time"
                                            value={requestPayload.start_time}
                                            onChange={(e) =>
                                                setRequestPayload(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        start_time:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            type="time"
                                        />
                                        {errors.start_time && (
                                            <p className="mt-3 ml-0 text-sm text-red-500">
                                                {errors.start_time}
                                            </p>
                                        )}
                                    </div>
                                    <div className="w-full mr-4 tablet:mt-5">
                                        <InputLabel>Sampai Dengan</InputLabel>
                                        <CustomInput
                                            id="until_date"
                                            value={requestPayload.end_time}
                                            onChange={(e) =>
                                                setRequestPayload(
                                                    (prevState) => ({
                                                        ...prevState,
                                                        end_time:
                                                            e.target.value,
                                                    })
                                                )
                                            }
                                            type="time"
                                        />
                                        {errors.end_time && (
                                            <p className="mt-3 ml-0 text-sm text-red-500">
                                                {errors.end_time}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="tablet:mr-4">
                                    <div className="w-1/2 mt-2 text-sm font-extrabold text-red-500 mobile:text-xs">
                                        **"Silakan tentukan rentang waktu
                                        (Tanggal Mulai, Waktu Mulai, Waktu
                                        Akhir) untuk Rekonsiliasi riwayat
                                        transaksi BRIVA Anda. Ingat, rentang
                                        waktu maksimal adalah 24 jam dan
                                        pengambilan laporan minimal 24 jam dari
                                        waktu transaksi."
                                    </div>
                                    <Button
                                        className="w-[49rem] mt-4 tablet:w-full tablet:mr-96 bg-white border-primary text-primary"
                                        variant="outlined"
                                        onClick={() =>
                                            handleSubmit(requestPayload)
                                        }
                                    >
                                        Mulai Rekonsiliasi
                                    </Button>
                                </div>
                            </div>

                            <div className="mt-5">
                                <CardWrapper>
                                    <CardTotals
                                        value={summary.totalChecked ?? 0}
                                        label="Total Transaksi Dicek"
                                        variant="totalChecked"
                                    />
                                    <CardTotals
                                        value={summary.matched ?? 0}
                                        label="Pembayaran Cocok (transaksi yang berhasil ditemukan & sesuai)"
                                        variant="matched"
                                    />
                                    <CardTotals
                                        value={summary.unpaid ?? 0}
                                        label="Belum Terbayar (tagihan yang belum ada pembayaran di sistem bank)"
                                        variant="unpaid"
                                    />
                                    <CardTotals
                                        value={summary.failed ?? 0}
                                        label="Gagal Diproses (data transaksi yang error/gagal saat rekonsiliasi)"
                                        variant="failed"
                                    />
                                </CardWrapper>
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
                                        {paginatedData.map(
                                            (
                                                {
                                                    trxId,
                                                    billingId,
                                                    va,
                                                    name,
                                                    amount,
                                                    trxDateTime,
                                                    statusReconcile,
                                                },
                                                index
                                            ) => {
                                                const isLast =
                                                    index ===
                                                    paginatedData.length - 1;
                                                const classes = isLast
                                                    ? "p-4"
                                                    : "pl-4 py-2 border-b border-blue-gray-150";
                                                return (
                                                    <tr
                                                        key={index}
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
                                                                    {trxId}
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
                                                                    className="font-medium underline capitalize"
                                                                >
                                                                    {va}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {name}
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
                                                                        amount
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
                                                                    {trxDateTime ===
                                                                    "-"
                                                                        ? "-"
                                                                        : moment(
                                                                              trxDateTime
                                                                          ).format(
                                                                              "DD MMM YYYY HH:mm"
                                                                          )}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className={`font-semibold capitalize ${getStatusColor(
                                                                        statusReconcile
                                                                    )} text-white rounded-xl w-32 flex justify-center
                                                                    `}
                                                                >
                                                                    {
                                                                        statusReconcile
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                            </CardBody>
                            {totalPages > 1 && (
                                <ClientPagination
                                    currentPage={currentPage}
                                    onPageChange={(page) =>
                                        setCurrentPage(page)
                                    }
                                    totalPages={totalPages}
                                />
                            )}
                        </Card>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </AuthenticatedLayout>
    );
};

export default VaReconcile;
