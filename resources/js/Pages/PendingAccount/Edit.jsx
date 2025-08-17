import React from "react";
import CustomInput from "@/Components/CustomInput";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputSelect from "@/Components/InputSelect";
import ImageItems from "@/Components/ImageItems";
import {
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Typography,
    Option,
    Select,
} from "@material-tailwind/react";

const EditPendingAccount = ({
    auth,
    userApartment,
    apartmentTower,
    apartmenetData,
    apartTowerData,
    apartId,
    unitCapacitiesOptions,
}) => {
    const role = auth.user.role;

    const { data, setData, post, processing, errors } = useForm({
        active: userApartment.active || 0,
        apartmentId:
            role === "SUPER ADMIN" ? userApartment.apartmentId : apartId,
        apartmentTowerId: userApartment.apartmentTowerId || "",
        powerCapacityId: userApartment.powerCapacityId || "",
        roomNo: userApartment.roomNo || 0,
    });

    const dataID = userApartment.id;

    const [userApartmentData, setUserApartmentData] = React.useState({
        id: userApartment.id,
        fullname: userApartment?.user?.fullname,
        email: userApartment?.user?.email,
        phone: userApartment?.user?.phone,
        apartment: apartmentTower?.apartment?.name,
        roomNo: userApartment.roomNo,
        apartType: userApartment?.apartType,
        apartmentTower: apartmentTower?.tower_name,
        powerCapacityId: userApartment?.powerCapacityId,
    });

    const [apartment, setApartment] = React.useState(
        apartmenetData.find((item) => item.value === userApartment.apartmentId)
    );
    const [tower, setTower] = React.useState(
        apartTowerData.find(
            (item) => item.value === userApartment.apartmentTowerId
        )
    );
    const [status, setStatus] = React.useState(userApartment.active);

    const findPowerCapacity = unitCapacitiesOptions.find(
        (item) => item.value === userApartment?.powerCapacityId || ""
    );

    const [powerCapacity, setPowerCapacity] = React.useState(
        findPowerCapacity?.value
    );

    const handlePowerCapacityChange = (value) => {
        setPowerCapacity(value);
        setData((prevValues) => ({
            ...prevValues,
            powerCapacityId: value,
        }));
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        setData((prevValues) => ({
            ...prevValues,
            active: value,
        }));
    };

    const handleTowerChange = (value) => {
        setTower(value);
        setData((prevValues) => ({
            ...prevValues,
            apartmentTowerId: value.value,
        }));
    };

    const handleApartmentChange = (value) => {
        setApartment(value);
        setData((prevValues) => ({
            ...prevValues,
            apartmentId: value.value,
        }));
    };

    const handleRoomChange = (value) => {};

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/account-management/${dataID}/update`);
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Billing Fine Rules
                </h2>
            }
        >
            <Head title="Activate Account" />
            <div className="py-12">
                <div className="w-full h-full mx-auto max-w-1xl sm:px-6 lg:px-8">
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
                            Daftar Akun
                        </Link>
                        <Link
                            href={route("accountActivation.edit", {
                                id: dataID,
                            })}
                            className="font-bold opacity-100 text-primary"
                        >
                            Aktivasi
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <div className="w-full h-fit">
                                <PageHeader
                                    title={"Kelola Aktivasi Akun"}
                                    description={
                                        "Informasi Detail Akun Pemilik/Penghuni yang mau diaktivasi"
                                    }
                                    showSearch={false}
                                />
                            </div>

                            <CardBody className="h-full !p-0 ">
                                <form onSubmit={handleSubmit}>
                                    <div className="flex flex-row justify-start tablet:flex-col">
                                        <div className="w-full mr-4 tablet:mt-0">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Nama Lengkap
                                            </Typography>
                                            <CustomInput
                                                label="Fullname"
                                                id="fullname"
                                                value={
                                                    userApartmentData.fullname
                                                }
                                                disabled={true}
                                            />
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-5">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Alamat Email
                                            </Typography>
                                            <CustomInput
                                                label="Email"
                                                id="email"
                                                value={userApartmentData.email}
                                                disabled={true}
                                            />
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-5">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Nomor HP
                                            </Typography>
                                            <CustomInput
                                                label="Phone"
                                                id="Phone"
                                                value={userApartmentData.phone}
                                                disabled={true}
                                            />
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-5">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Daya Unit
                                            </Typography>
                                            <Select
                                                label="Pilih Daya Listrik"
                                                id="power_capacity"
                                                color="blue"
                                                value={powerCapacity}
                                                onChange={
                                                    handlePowerCapacityChange
                                                }
                                            >
                                                {unitCapacitiesOptions.map(
                                                    (item, index) => (
                                                        <Option
                                                            key={index}
                                                            value={item.value}
                                                        >
                                                            {item.label}
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Apartement
                                            </Typography>
                                            {role === "SUPER ADMIN" ? (
                                                <InputSelect
                                                    label="Apartment"
                                                    value={apartment}
                                                    onChange={
                                                        handleApartmentChange
                                                    }
                                                    options={apartmenetData}
                                                />
                                            ) : (
                                                <CustomInput
                                                    label="Apartment"
                                                    id="apartment"
                                                    value={
                                                        userApartmentData?.apartment
                                                    }
                                                    disabled={true}
                                                />
                                            )}
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Nomor Unit
                                            </Typography>

                                            <CustomInput
                                                label="Unit Number"
                                                id="Nomor Unit"
                                                value={data.roomNo}
                                                onChange={(e) =>
                                                    setData(
                                                        "roomNo",
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Tipe Unit
                                            </Typography>

                                            <CustomInput
                                                label="Unit Number"
                                                id="unitNumber"
                                                value={
                                                    userApartmentData?.apartType
                                                        .name
                                                }
                                                disabled={true}
                                            />
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Nama Tower
                                            </Typography>

                                            <InputSelect
                                                label="Tower"
                                                value={tower}
                                                onChange={handleTowerChange}
                                                options={apartTowerData}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col">
                                        <div className="w-full mr-4 tablet:mt-0">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold"
                                            >
                                                Foto KTP
                                            </Typography>
                                            <ImageItems
                                                imagePath={
                                                    userApartment.identityImage
                                                }
                                                alt="ktp"
                                                imageType="id"
                                                errorMesssageImg="Foto KTP Tidak Tersedia"
                                                variant="preview"
                                            />
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-8 h-fit">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold"
                                            >
                                                Foto Wajah
                                            </Typography>
                                            <ImageItems
                                                imagePath={
                                                    userApartment.userImage
                                                }
                                                alt="userSignature"
                                                imageType="user"
                                                errorMesssageImg="Foto Wajah Tidak Tersedia"
                                                variant="preview"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Status Akun
                                            </Typography>
                                            <Select
                                                label="Status Akun"
                                                id="status"
                                                color="blue"
                                                value={status}
                                                onChange={handleStatusChange}
                                            >
                                                <Option value={0}>
                                                    Inactive
                                                </Option>
                                                <Option value={1}>
                                                    Active
                                                </Option>
                                            </Select>
                                            {errors.active && (
                                                <p className="mt-3 ml-0 text-sm text-red-500">
                                                    {errors.active}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-row mt-8">
                                            <div className="flex gap-4 ml-0 w-max">
                                                <Button
                                                    variant="filled"
                                                    className="bg-green-500"
                                                    onClick={handleSubmit}
                                                    loading={processing}
                                                >
                                                    Simpan
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
};

export default EditPendingAccount;
