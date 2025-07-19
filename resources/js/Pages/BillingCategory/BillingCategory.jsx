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
import {
    FolderPlusIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/24/solid";
import { usePage, router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import Pagination from "@/Components/Pagination";
import PageHeader from "@/Components/PageHeader";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TABLE_HEAD = [
    "No",
    "Nama Kategori",
    "Jenis Tagihan",
    "Tower",
    "Keterangan",
    "Harga",
    "Minimum Charge",
    "Apartement",
    "Dibuat Oleh",
    "Edit",
    "Hapus",
];

export default function BillingCategory({ auth, errors, data, filters }) {
    const [search, setSearch] = useState("");
    const { flash } = usePage().props;
    const role = auth.user.role;

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
        if (flash.error) {
            toast.error(flash.error);
        }
    }, [flash.message, flash.error]);

    const buttonIcon = <FolderPlusIcon strokeWidth={2} className="w-4 h-4" />;

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
            <Head title="Billing Category" />

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
                            href={route("billingCategory.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Billing Category
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12">
                            <PageHeader
                                searchValue={search}
                                handleSearch={(event) =>
                                    handleSearch(event.target.value, "search")
                                }
                                title={"Billing Category List"}
                                description={
                                    "Informasi Data Kategori Tagihan pada Apartemen"
                                }
                                buttonLabel={"Tambah Kategori Tagihan"}
                                icon={buttonIcon}
                                label="Cari Data Kategori Tagihan"
                                addRoute={"billingCategory.add"}
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
                                                    category_name,
                                                    billing_type,
                                                    unit_price,
                                                    minimum_charge,
                                                    power_capacity_value,
                                                    tower,
                                                    apartment,
                                                    created_by,
                                                    id,
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
                                                                        category_name
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
                                                                    {tower?.tower_name
                                                                        ? tower?.tower_name
                                                                        : "-"}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-semibold capitalize"
                                                                >
                                                                    {power_capacity_value
                                                                        ? power_capacity_value +
                                                                          " VA"
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
                                                                        unit_price
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
                                                                    {new Intl.NumberFormat(
                                                                        "id-ID",
                                                                        {
                                                                            style: "currency",
                                                                            currency:
                                                                                "IDR",
                                                                        }
                                                                    ).format(
                                                                        minimum_charge
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
                                                                    {
                                                                        created_by.name
                                                                    }
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <Tooltip
                                                                content="Edit Billing Category"
                                                                animate={{
                                                                    mount: {
                                                                        scale: 1,
                                                                        y: 0,
                                                                    },
                                                                    unmount: {
                                                                        scale: 0,
                                                                        y: 25,
                                                                    },
                                                                }}
                                                                className="bg-green-600"
                                                            >
                                                                <Link
                                                                    href={route(
                                                                        "billingCategory.edit",
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
                                                                    <IconButton
                                                                        variant="filled"
                                                                        color="green"
                                                                    >
                                                                        <PencilIcon className="w-4 h-4" />
                                                                    </IconButton>
                                                                </Link>
                                                            </Tooltip>
                                                        </td>
                                                        <td className={classes}>
                                                            {role ===
                                                            "SUPER ADMIN" ? (
                                                                <Link
                                                                    href={route(
                                                                        "billingCategory.delete",
                                                                        {
                                                                            id: id,
                                                                        }
                                                                    )}
                                                                    method="post"
                                                                    as="button"
                                                                >
                                                                    <Tooltip
                                                                        content="Delete Billing Category"
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
                                                                </Link>
                                                            ) : (
                                                                <Tooltip content="You don't have permission">
                                                                    <IconButton
                                                                        color="gray"
                                                                        variant="filled"
                                                                        disabled
                                                                    >
                                                                        <TrashIcon className="w-4 h-4" />
                                                                    </IconButton>
                                                                </Tooltip>
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
