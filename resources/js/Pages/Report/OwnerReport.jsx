import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import {
    Card,
    Typography,
    CardBody,
    IconButton,
    Tooltip,
    Breadcrumbs,
} from "@material-tailwind/react";
import { router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Pagination from "@/Components/Pagination";
import PageHeader from "@/Components/PageHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { EyeIcon } from "@heroicons/react/24/outline";
import { stickyColumnStyles } from "@/utils/constant";

const TABLE_HEAD = [
    "No Unit",
    "Nama Owner",
    "Tower",
    "Tipe Unit",
    "Apartemen",
    "Nomor HP",
    "Email",
    "No Identitas",
    "View",
];

export default function OwnerReport({ auth, errors, data, filters }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState("");

    function handleSearch(value, type) {
        if (type === "search") {
            setSearch(value);
        }
        router.get(
            route(route().current()),
            { search: type === "search" ? value : search },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function getPaginationUrl(baseUrl, searchQuery) {
        if (searchQuery) {
            // Include the search query in the URL
            return `${baseUrl}${
                baseUrl.includes("?") ? "&" : "?"
            }search=${encodeURIComponent(searchQuery)}`;
        } else {
            // Don't include the search query
            return baseUrl;
        }
    }

    useEffect(() => {
        if (flash.message) {
            toast.success(flash.message);
        }
    }, [flash.message]);

    // console.log(data.data);

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Laporan Pemilik/Penghuni Unit
                </h2>
            }
        >
            <Head title="Laporan Pemilik/Penghuni Unit" />

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
                            href={route("owner.report.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Laporan Berdasarkan Pemilik/Penghuni Unit
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                searchValue={search}
                                handleSearch={(event) =>
                                    handleSearch(event.target.value, "search")
                                }
                                title={"Laporan Pemilik/Penghuni Unit"}
                                description={
                                    "Informasi Data Tagihan dari Setiap Pemilik/Penghuni Unit"
                                }
                                buttonLabel={"Tambah Unit Owner"}
                                addRoute={"unitowner.add"}
                                label="Cari Nama Pemilik / Nomor Unit"
                                showAddButton={false}
                            />
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
                                                        userId,
                                                        user,
                                                        owner_name,
                                                        roomNo,
                                                        apartmentTower,
                                                        apartmentTypeData,
                                                        apartment,
                                                        id,
                                                    },
                                                    index
                                                ) => {
                                                    const isLast =
                                                        index ===
                                                        data.data.length - 1;
                                                    const classes = isLast
                                                        ? "pl-4 "
                                                        : "pl-4   border-b border-blue-gray-150";

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
                                                                        {roomNo}
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
                                                                        {
                                                                            user?.fullname
                                                                        }
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
                                                                        {
                                                                            apartmentTower.tower_name
                                                                        }
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
                                                                        {apartmentTypeData?.name ??
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
                                                                        {
                                                                            apartment.name
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
                                                                            user.phone
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
                                                                            user.email
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
                                                                        {userId}
                                                                    </Typography>
                                                                </div>
                                                            </td>

                                                            <td
                                                                className={
                                                                    classes
                                                                }
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        "owner.report.show",
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
                                                                        content={`Lihat Detail Histori - ${user.fullname}`}
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
                                                                        className="bg-primary/80"
                                                                    >
                                                                        <IconButton
                                                                            variant="fill"
                                                                            // color="blue"
                                                                            className="bg-primary hover:bg-primaryHover"
                                                                        >
                                                                            <EyeIcon className="w-4 h-4" />
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
                                </div>
                            </CardBody>
                            <Pagination
                                current_page={data.current_page}
                                last_page={data.last_page}
                                prev_page_url={data.prev_page_url}
                                next_page_url={data.next_page_url}
                                search={filters.search}
                                getPaginationUrl={getPaginationUrl}
                            />
                        </Card>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </AuthenticatedLayout>
    );
}
