import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    Typography,
    CardBody,
    IconButton,
    Tooltip,
    Breadcrumbs,
    Select,
    Option,
} from "@material-tailwind/react";
import { FolderPlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import { router, usePage } from "@inertiajs/react";
import { useState, useEffect } from "react";
import Pagination from "@/Components/Pagination";
import PageHeader from "@/Components/PageHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputLabel from "@/Components/InputLabel";
import ImageItems from "@/Components/ImageItems";

const TABLE_HEAD = [
    "No",
    "No Identitas",
    "Nama",
    "Nomor HP",
    "Email",
    "Apartemen",
    "Tower",
    "No Unit",
    "Tipe Unit",
    "status",
    "Foto KTP",
    "Active",
];

const PendingAccountList = ({ auth, data, filters, errors }) => {
    const { flash } = usePage().props;
    const [status, setStatus] = useState("");
    const [search, setSearch] = useState("");

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
                status: type === "status" ? value : status,
            },
            {
                preserveState: true,
                replace: true,
            }
        );
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

    const buttonIcon = <FolderPlusIcon strokeWidth={2} className="w-4 h-4" />;

    useEffect(() => {
        if (flash.message) {
            toast.success(flash.message);
        }
    }, [flash.message]);

    function getStatusColor(status) {
        switch (status) {
            case 0:
                return "bg-orange-500"; // Yellow background for pending status
            case 1:
                return "bg-green-500"; // Green background for success status
            default:
                return ""; // Default background color
        }
    }

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Account Management
                </h2>
            }
        >
            <Head title=" Account Managment" />

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
                            href={route("accountActivation.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Account Management
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                searchValue={search}
                                handleSearch={(e) =>
                                    handleInputChange(e.target.value, "search")
                                }
                                title={"Account Managment"}
                                description={"Informasi Data Akun User"}
                                showAddButton={false}
                                label="Cari Nama Akun"
                                hasFilter={true}
                            />
                            <div className="mt-5">
                                <div className="flex flex-wrap ">
                                    <div className="w-[21rem] mr-4 tablet:w-full">
                                        <InputLabel>
                                            Status Aktivasi Akun
                                        </InputLabel>
                                        <Select
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
                                                Status Aktivasi Akun
                                            </Option>
                                            <Option value="0">Inactive</Option>
                                            <Option value="1">Active</Option>
                                        </Select>
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
                                                    className="py-4 pl-4 border-y bg-primary "
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
                                        {data?.data?.map(
                                            (
                                                {
                                                    id,
                                                    userId,
                                                    user,
                                                    apartmentTower,
                                                    apartment,
                                                    identityImage,
                                                    roomNo,
                                                    apartType,
                                                    active,
                                                },
                                                index,
                                                array
                                            ) => {
                                                const isLast =
                                                    index === array.length - 1;
                                                const classes = isLast
                                                    ? "pl-4"
                                                    : "pl-4 border-b border-blue-gray-150";

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
                                                                    {userId}
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
                                                                        user.fullname
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
                                                                    {user.phone}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {user.email}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {apartment
                                                                        ? apartment.name
                                                                        : "No Apartment"}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {apartmentTower
                                                                        ? apartmentTower.tower_name
                                                                        : "No Tower"}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {roomNo ??
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
                                                                    {apartType?.name ??
                                                                        "-"}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className={`font-bold capitalize  ${getStatusColor(
                                                                        active
                                                                    )} text-white rounded-2xl w-20 flex justify-center`}
                                                                >
                                                                    {active ===
                                                                    1
                                                                        ? "Active"
                                                                        : "Inactive"}
                                                                </Typography>
                                                            </div>
                                                        </td>

                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <ImageItems
                                                                    imagePath={
                                                                        identityImage
                                                                    }
                                                                    alt="Foto KTP"
                                                                    loading="lazy"
                                                                    imageType="id"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <Link
                                                                href={route(
                                                                    "accountActivation.edit",
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
                                                                <Tooltip
                                                                    content="Aktifkan Akun"
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
                                                                    <IconButton
                                                                        variant="filled"
                                                                        color="green"
                                                                    >
                                                                        <PencilIcon className="w-4 h-4" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            </Link>
                                                        </td>
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

export default PendingAccountList;
