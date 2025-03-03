import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import {
    Card,
    Typography,
    CardBody,
    IconButton,
    Button,
    Tooltip,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Breadcrumbs,
} from "@material-tailwind/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FolderPlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import { router, usePage, Head, Link, useForm } from "@inertiajs/react";
import { useEffect, useState } from "react";
import moment from "moment";
import Pagination from "@/Components/Pagination";
import PageHeader from "@/Components/PageHeader";
import { ToastContainer, toast } from "react-toastify";
import ModalCustom from "@/Components/ModalCustom";
import InputSelect from "@/Components/InputSelect";
import CustomInput from "@/Components/CustomInput";
import "react-toastify/dist/ReactToastify.css";

const TABLE_HEAD = [
    "No Identitas",
    "Nama Owner",
    "Nomor HP",
    "Apartemen",
    "Tower",
    "No Apartemen",
    "Dibuat Pada Tanggal",
    "Dibuat Oleh",
    "Edit",
];

export default function UnitOwner({
    auth,
    UnitOwnerData,
    filters,
    apartmenetData,
    apartId,
    apartName,
    apartmentTower,
}) {
    const role = auth.user.role;
    const { flash } = usePage().props;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ownerId, setOwnerId] = useState(null);
    const [ownerData, setOwnerData] = useState(
        UnitOwnerData.data.find((item) => item.id === ownerId) || null
    );

    const { data, setData, post, processing, errors } = useForm({
        owner_name: ownerData?.owner_name,
        phone: ownerData?.phone,
        email: ownerData?.email,
        identity_no: ownerData?.identity_no,
        room_no: ownerData?.room_no,
        tower_id: ownerData?.tower_id,
        apartment_id:
            role === "SUPER ADMIN" ? ownerData?.apartment_id : apartId,
    });

    const initialApartment = apartmenetData.find(
        (apartment) => apartment.value === ownerData?.apartment_id
    );
    const [apartment, setApartment] = useState(initialApartment);
    const [tower, setTower] = useState(
        apartmentTower.find(
            (tower) => tower.value === ownerData?.tower_id || null
        )
    );

    const handleModalClose = () => {
        setIsModalOpen(false);
        setOwnerId(null);
        setOwnerData(null);
        setTower(null);
    };

    const handleEditClick = (id) => {
        const ownerSelected = UnitOwnerData.data.find((item) => item.id === id);
        setOwnerId(id);
        setOwnerData(ownerSelected);
        setTower(
            apartmentTower.find((item) => item.value === ownerSelected.tower_id)
        );
        if (ownerSelected) {
            setData({
                owner_name: ownerSelected.owner_name,
                phone: ownerSelected.phone,
                email: ownerSelected.email,
                identity_no: ownerSelected.identity_no,
                room_no: ownerSelected.room_no,
                tower_id: ownerSelected.tower_id,
                apartment_id:
                    role === "SUPER ADMIN"
                        ? ownerSelected.apartment_id
                        : apartId,
            });
        }
        setIsModalOpen(true);
    };

    const handleTowerChange = (value) => {
        setTower(value);
        setData((prevValue) => ({
            ...prevValue,
            tower_id: value.value,
        }));
    };

    const handleApartmentChange = (value) => {
        setApartment(value);
        setData((prevValues) => ({
            ...prevValues,
            apartment_id: value.value,
        }));
    };

    const dataID = ownerData?.id;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/unit-owner/${dataID}/update`, {
            onSuccess: () => {
                handleModalClose();
            },
        });
    };

    function handleSearch(event) {
        router.get(
            route(route().current()),
            { search: event.target.value },
            {
                preserveState: true,
                replace: true,
            }
        );
    }

    function getPaginationUrl(baseUrl, searchQuery) {
        if (searchQuery) {
            // Include the search query in the URL
            return `${baseUrl}&search=${searchQuery}`;
        } else {
            // Don't include the search query
            return baseUrl;
        }
    }

    const buttonIcon = <FolderPlusIcon strokeWidth={2} className="w-4 h-4" />;

    useEffect(() => {
        if (flash.message) {
            toast.success(flash.message);
        }
    }, [flash.message]);

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
            <Head title="Unit Owner" />

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
                            href={route("unitowner.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Unit Owner
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                handleSearch={handleSearch}
                                title={"Unit Owner List"}
                                description={
                                    "Informasi Data Unit Owner pada Apartemen"
                                }
                                buttonLabel={"Tambah Unit Owner"}
                                icon={buttonIcon}
                                addRoute={"unitowner.add"}
                                label="Cari Nama Unit Owner"
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
                                        {UnitOwnerData.data.map(
                                            (
                                                {
                                                    identity_no,
                                                    owner_name,
                                                    phone,
                                                    apartment,
                                                    room_no,
                                                    created_at,
                                                    tower,
                                                    id,
                                                    created_by,
                                                },
                                                index
                                            ) => {
                                                const isLast =
                                                    index ===
                                                    UnitOwnerData.data.length -
                                                        1;
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
                                                                    {
                                                                        identity_no
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
                                                                    {owner_name}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <div className="flex flex-col">
                                                                <Typography
                                                                    variant="small"
                                                                    className="font-normal capitalize"
                                                                >
                                                                    {phone}
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
                                                                    {tower?.tower_name
                                                                        ? tower.tower_name
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
                                                                    {room_no}
                                                                </Typography>
                                                            </div>
                                                        </td>
                                                        <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="font-normal"
                                                            >
                                                                {moment(
                                                                    created_at
                                                                ).format("LL")}
                                                            </Typography>
                                                        </td>
                                                        <td className={classes}>
                                                            <Typography
                                                                variant="small"
                                                                className="font-normal"
                                                            >
                                                                {
                                                                    created_by.name
                                                                }
                                                            </Typography>
                                                        </td>

                                                        <td className={classes}>
                                                            <Tooltip
                                                                content="Edit Unit Owner"
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
                                                                <Button
                                                                    size="md"
                                                                    onClick={() =>
                                                                        handleEditClick(
                                                                            id
                                                                        )
                                                                    }
                                                                    variant="gradient"
                                                                    color="green"
                                                                >
                                                                    <PencilIcon className="w-4 h-4" />
                                                                </Button>
                                                            </Tooltip>
                                                        </td>
                                                    </tr>
                                                );
                                            }
                                        )}
                                    </tbody>
                                </table>
                                {isModalOpen && ownerData && (
                                    <ModalCustom
                                        isOpen={isModalOpen}
                                        onClose={handleModalClose}
                                    >
                                        <DialogHeader className="relative block m-0">
                                            <PageHeader
                                                title={"Edit Unit Owner Data"}
                                                description={
                                                    "Edit Informasi Unit Owner"
                                                }
                                                showSearch={false}
                                            />
                                            <IconButton
                                                size="sm"
                                                variant="text"
                                                className="!absolute right-3.5 top-3.5"
                                                onClick={handleModalClose}
                                            >
                                                <XMarkIcon className="w-4 h-4 stroke-2" />
                                            </IconButton>
                                        </DialogHeader>
                                        <section className="overflow-scroll tablet:max-h-[50vh]">
                                            <DialogBody className="h-full pb-6 space-y-4">
                                                <form onSubmit={handleSubmit}>
                                                    <div className="flex flex-row justify-start w-full tablet:flex-col">
                                                        <div className="flex flex-col w-full mr-4">
                                                            <Typography
                                                                variant="h3"
                                                                className="mb-2 text-base font-semibold tablet:mb-0 "
                                                            >
                                                                ID:{" "}
                                                                {ownerData?.id}
                                                            </Typography>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row justify-start w-full tablet:flex-col">
                                                        <div className="flex flex-col w-full mr-4 tablet:mt-8">
                                                            {role ===
                                                            "SUPER ADMIN" ? (
                                                                <InputSelect
                                                                    value={
                                                                        apartment
                                                                    }
                                                                    onChange={
                                                                        handleApartmentChange
                                                                    }
                                                                    options={
                                                                        apartmenetData
                                                                    }
                                                                />
                                                            ) : (
                                                                <CustomInput
                                                                    label="Nama Apartemen"
                                                                    value={
                                                                        apartName
                                                                    }
                                                                    className=""
                                                                    disabled={
                                                                        true
                                                                    }
                                                                />
                                                            )}
                                                            {errors.apartment_id && (
                                                                <p className="mt-3 ml-0 text-sm text-red-500">
                                                                    {
                                                                        errors.apartment_id
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col w-full mr-4 tablet:mt-8">
                                                            <InputSelect
                                                                value={tower}
                                                                onChange={
                                                                    handleTowerChange
                                                                }
                                                                options={
                                                                    apartmentTower
                                                                }
                                                            />
                                                            {errors.tower_id && (
                                                                <p className="mt-3 ml-0 text-sm text-red-500">
                                                                    {
                                                                        errors.tower_id
                                                                    }
                                                                </p>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col w-full mr-4 tablet:mt-0">
                                                            <CustomInput
                                                                label="Nomor Apartemen"
                                                                id="room_no"
                                                                value={
                                                                    data.room_no
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "room_no",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                errors={
                                                                    errors.room_no
                                                                }
                                                                className="tablet:mt-8"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
                                                        <div className="flex flex-col w-full mr-4 tablet:mt-0">
                                                            <CustomInput
                                                                label="Nomor Identitas"
                                                                id="identity_no"
                                                                value={
                                                                    data.identity_no
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "identity_no",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                errors={
                                                                    errors.identity_no
                                                                }
                                                                className="tablet:mt-8"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col w-full mr-4 tablet:mt-8">
                                                            <CustomInput
                                                                label="Nama Owner"
                                                                id="owner_name"
                                                                value={
                                                                    data.owner_name
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "owner_name",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                errors={
                                                                    errors.owner_name
                                                                }
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
                                                        <div className="flex flex-col w-full mr-4 tablet:mt-0">
                                                            <CustomInput
                                                                label="Email"
                                                                id="email"
                                                                value={
                                                                    data.email
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "email",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                errors={
                                                                    errors.email
                                                                }
                                                                className="tablet:mt-8"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col w-full mr-4 tablet:mt-0">
                                                            <CustomInput
                                                                label="Nomor HP"
                                                                id="phone"
                                                                value={
                                                                    data.phone
                                                                }
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "phone",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                errors={
                                                                    errors.phone
                                                                }
                                                                className="tablet:mt-8"
                                                            />
                                                        </div>
                                                    </div>
                                                </form>
                                            </DialogBody>
                                            <DialogFooter>
                                                <Button
                                                    variant="filled"
                                                    onClick={handleSubmit}
                                                    loading={processing}
                                                    className="ml-auto bg-green-500"
                                                >
                                                    Edit Data
                                                </Button>
                                            </DialogFooter>
                                        </section>
                                    </ModalCustom>
                                )}
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
