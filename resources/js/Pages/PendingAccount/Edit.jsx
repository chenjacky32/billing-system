import React from "react";
import CustomInput from "@/Components/CustomInput";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputSelect from "@/Components/InputSelect";
import {
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Typography,
    Option,
    Select,
} from "@material-tailwind/react";

const EditPendingAccount = ({ auth, userApartment, apartmentTower }) => {
    const { data, setData, post, processing, errors } = useForm({
        active: userApartment.active || 0,
    });

    const dataID = userApartment.id;

    const [userApartmentData, setUserApartmentData] = React.useState({
        id: userApartment.id,
        fullname: userApartment?.user?.fullname,
        email: userApartment?.user?.email,
        phone: userApartment?.user?.phone,
        apartment: apartmentTower?.apartment?.name,
        apartmentTower: apartmentTower?.tower_name,
    });

    const [status, setStatus] = React.useState(userApartment.active);

    const handleStatusChange = (value) => {
        setStatus(value);
        setData((prevValues) => ({
            ...prevValues,
            active: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/account-pending/${dataID}/update`);
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
                <div className="max-w-1xl mx-auto sm:px-6 lg:px-8 w-full h-[35rem] tablet:h-[55rem]">
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
                            Account List
                        </Link>
                        <Link
                            href={route("accountActivation.edit", {
                                id: dataID,
                            })}
                            className="font-bold opacity-100 text-primary"
                        >
                            Activation
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <div className="w-full h-fit">
                                <PageHeader
                                    title={"Account Pending"}
                                    description={
                                        "Informasi Detail Akun Pending"
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
                                    </div>
                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Apartement
                                            </Typography>
                                            <CustomInput
                                                label="Apartment"
                                                id="apartment"
                                                value={
                                                    userApartmentData?.apartment
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
                                            <CustomInput
                                                label="Tower"
                                                id="tower"
                                                value={
                                                    userApartmentData?.apartmentTower
                                                }
                                                disabled={true}
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
                                                    Save
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
