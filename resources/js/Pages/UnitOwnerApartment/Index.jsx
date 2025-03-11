import React, { useState } from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import axios from "axios";
import { router, usePage, Head, Link, useForm } from "@inertiajs/react";
import {
    Card,
    Typography,
    CardBody,
    IconButton,
    Tooltip,
    Breadcrumbs,
    DialogHeader,
    DialogBody,
    DialogFooter,
    Button,
} from "@material-tailwind/react";
import { FolderPlusIcon, PencilIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import Pagination from "@/Components/Pagination";
import PageHeader from "@/Components/PageHeader";
import ModalCustom from "@/Components/ModalCustom";
import InputSelect from "@/Components/InputSelect";
import CustomInput from "@/Components/CustomInput";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TABLE_HEAD = [
    "No",
    "No Identitas",
    "Nama Owner",
    "Nomor HP",
    "Email",
    "Apartemen",
    "Tower",
    "No Unit",
    "Edit",
];

const UserApartment = ({
    auth,
    userApartments,
    filters,
    apartmentName,
    apartmentTower,
    apartmenetData,
    apartId,
}) => {
    const role = auth.user.role;
    const { flash } = usePage().props;
    const [isPasswordVerified, setIsPasswordVerified] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [ownerId, setOwnerId] = useState(null);
    const [ownerData, setOwnerData] = useState(
        userApartments.data.find((item) => item.id === ownerId) || null
    );
    const initialApartment = apartmenetData.find(
        (apartment) => apartment.value === ownerData?.apartmentId
    );
    const [apartment, setApartment] = useState(initialApartment);
    const [tower, setTower] = useState(
        apartmentTower.find(
            (tower) => tower.value == ownerData?.apartmentTowerId || null
        )
    );
    const [isLoading, setIsLoading] = useState(null);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [pendingEditId, setPendingEditId] = useState("");

    const { data, setData, post, processing, errors } = useForm({
        roomNo: ownerData?.roomNo || "",
        apartmentTowerId: ownerData?.apartmentTowerId || "",
        password: "",
        apartmentId: role === "SUPER ADMIN" ? ownerData?.apartmentId : apartId,
    });

    const handleModalClose = () => {
        setIsModalOpen(false);
        setOwnerId(null);
        setOwnerData(null);
        setTower(null);
        setIsPasswordVerified(null);
        setData((prevValue) => ({
            ...prevValue,
            password: "",
        }));
    };

    const handleClosePasswordModal = () => {
        setIsPasswordModalOpen(false);
        setPendingEditId(null);
        setPasswordError("");
        setIsPasswordVerified(null);
        setData((prevValue) => ({
            ...prevValue,
            password: "",
        }));
    };

    const handleEditClick = (id) => {
        if (role === "SUPER ADMIN") {
            const ownerSelected = userApartments.data.find(
                (item) => item.id === id
            );
            setOwnerId(id);
            setOwnerData(ownerSelected);
            setTower(
                apartmentTower.find(
                    (item) => item.value === ownerSelected.apartmentTowerId
                )
            );
            if (ownerSelected) {
                setData({
                    roomNo: ownerSelected.roomNo,
                    apartmentTowerId: ownerSelected.apartmentTowerId,
                    apartmentId:
                        role === "SUPER ADMIN"
                            ? ownerSelected.apartmentId
                            : apartId,
                });
            }
            setIsModalOpen(true);
        } else {
            setPendingEditId(id);
            setIsPasswordModalOpen(true);
            setPasswordError("");
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setIsLoading("verify-password");
        setPasswordError("");
        try {
            const response = await axios.post(route("resourceAccess.verify"), {
                password: data.password,
                apartmentId: data.apartmentId,
            });

            if (response.data.success) {
                const id = pendingEditId;
                const ownerSelected = userApartments.data.find(
                    (item) => item.id === id
                );
                setOwnerId(id);
                setOwnerData(ownerSelected);
                setTower(
                    apartmentTower.find(
                        (item) => item.value === ownerSelected.apartmentTowerId
                    )
                );
                if (ownerSelected) {
                    setData({
                        roomNo: ownerSelected.roomNo,
                        apartmentTowerId: ownerSelected.apartmentTowerId,
                        apartmentId:
                            role === "SUPER ADMIN"
                                ? ownerSelected.apartmentId
                                : apartId,
                    });
                }
                setIsPasswordModalOpen(false);
                setIsModalOpen(true);
            } else {
                setPasswordError(
                    response.data.errors?.password ||
                        "Incorrect password, please try again."
                );
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

    const handleTowerChange = (value) => {
        setTower(value);
        setData((prevValue) => ({
            ...prevValue,
            apartmentTowerId: value.value,
        }));
    };

    const handleApartmentChange = (value) => {
        setApartment(value);
        setData((prevValues) => ({
            ...prevValues,
            apartmentTowerId: value.value,
        }));
    };

    const dataID = ownerData?.id;

    const handleSubmit = (e) => {
        e.preventDefault();
        setIsLoading("edit-owner");
        post(`/unit-owner-apartment/${dataID}/update`, {
            onSuccess: () => {
                handleModalClose();
                setTimeout(() => {
                    toast.success("Unit owner data has been updated!");
                }, 100);
            },
            onFinish: () => setIsLoading(null),
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

    useEffect(() => {
        if (flash.message) {
            toast.success(flash.message);
            console.log("useEffect 1");
        }
    }, [flash.message]);

    const buttonIcon = <FolderPlusIcon strokeWidth={2} className="w-4 h-4" />;

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    User/Owner Apartment List
                </h2>
            }
        >
            <Head title="Billing Fine Rules" />

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
                            href={route("unitOwnerApartment.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Unit Owner List
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12">
                            <PageHeader
                                handleSearch={handleSearch}
                                title={"Unit Owner Apartment List"}
                                description={
                                    "Informasi Data Unit Owner Pada Apartemen"
                                }
                                buttonLabel={"Tambah Unit Owner"}
                                icon={buttonIcon}
                                label="Cari Nama Unit Owner"
                                showAddButton={false}
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
                                        {userApartments.data.map(
                                            (
                                                {
                                                    id,
                                                    userId,
                                                    apartmentTower,
                                                    roomNo,
                                                    user,
                                                },
                                                index
                                            ) => {
                                                const isLast =
                                                    index ===
                                                    userApartments.data.length -
                                                        1;
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
                                                                    {apartmentTower
                                                                        ?.apartment
                                                                        ?.name ||
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
                                                                    {apartmentTower?.tower_name ||
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
                                                                    {roomNo ??
                                                                        "-"}
                                                                </Typography>
                                                            </div>
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
                                                    "Silahkan masukkan kata sandi untuk melanjutkan proses Edit Unit Owner."
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
                                                        value={data.password}
                                                        onChange={(e) =>
                                                            setData(
                                                                "password",
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
                                                                        apartmentName
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
                                                                        errors.apartmentId
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
                                                                    data.roomNo ??
                                                                    ""
                                                                }
                                                                type="number"
                                                                onChange={(e) =>
                                                                    setData(
                                                                        "roomNo",
                                                                        e.target
                                                                            .value
                                                                    )
                                                                }
                                                                errors={
                                                                    errors.roomNo
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
                                                                    ownerData?.userId ??
                                                                    ""
                                                                }
                                                                disabled
                                                                className="tablet:mt-8"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col w-full mr-4 tablet:mt-8">
                                                            <CustomInput
                                                                label="Nama Owner"
                                                                id="owner_name"
                                                                value={
                                                                    ownerData
                                                                        ?.user
                                                                        ?.fullname
                                                                }
                                                                disabled
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
                                                        <div className="flex flex-col w-full mr-4 tablet:mt-0">
                                                            <CustomInput
                                                                label="Email"
                                                                id="email"
                                                                value={
                                                                    ownerData
                                                                        ?.user
                                                                        ?.email
                                                                }
                                                                disabled
                                                                className="tablet:mt-8"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col w-full mr-4 tablet:mt-0">
                                                            <CustomInput
                                                                label="Nomor HP"
                                                                id="phone"
                                                                value={
                                                                    ownerData
                                                                        ?.user
                                                                        ?.phone
                                                                }
                                                                disabled
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
                                                    loading={
                                                        isLoading ===
                                                        "edit-owner"
                                                    }
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
                                current_page={userApartments.current_page}
                                last_page={userApartments.last_page}
                                prev_page_url={userApartments.prev_page_url}
                                next_page_url={userApartments.next_page_url}
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
};

export default UserApartment;
