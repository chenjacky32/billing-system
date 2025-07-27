import React from "react";
import CustomInput from "@/Components/CustomInput";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import InputSelect from "@/Components/InputSelect";
import { Breadcrumbs, Button, Card, CardBody } from "@material-tailwind/react";
import { useState } from "react";

const AddApartmentTower = ({
    auth,
    apartmentData,
    apartmentName,
    apartmentId,
}) => {
    const role = auth.user.role;
    const [apartment, setApartment] = useState(apartmentData[0]);

    const { data, setData, post, processing, errors } = useForm({
        tower_name: "",
        total_room: "",
        apartment_id: role === "SUPER ADMIN" ? "" : apartmentId,
    });

    const handleApartmentChange = (value) => {
        setApartment(value);
        setData((prevValues) => ({
            ...prevValues,
            apartment_id: value.value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post("/apartement-tower/store");
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add Apartment Tower
                </h2>
            }
        >
            <Head title="Add Apartment Tower" />
            <div className="py-12">
                <div
                    className={`${
                        role === "SUPER ADMIN"
                            ? "h-[35rem] tablet:h-[55rem]"
                            : "null"
                    } w-full mx-auto max-w-1xl sm:px-6 lg:px-8`}
                >
                    <Breadcrumbs className="ml-[-0.9rem] w-96 bg-transparent">
                        <Link
                            href={route("dashboard")}
                            className="opacity-60 text-primaryHover "
                        >
                            Dashboard
                        </Link>
                        <Link
                            href={route("apartementTower.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Tower Apartemen
                        </Link>
                        <Link
                            href={route("apartementTower.add")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Tambah
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                title={"Data Tower Apartemen Baru"}
                                description={
                                    "Tambah Informasi Data Tower Apartemen yang Baru"
                                }
                                showSearch={false}
                            />
                            <CardBody className="h-full px-0 ">
                                <form>
                                    <div className="flex flex-row justify-start tablet:flex-col">
                                        {role === "SUPER ADMIN" ? (
                                            <InputSelect
                                                value={apartment}
                                                onChange={handleApartmentChange}
                                                options={apartmentData}
                                            />
                                        ) : (
                                            <CustomInput
                                                label="Nama Apartemen"
                                                value={apartmentName}
                                                className=""
                                                disabled={true}
                                            />
                                        )}
                                        {errors.apartment_id && (
                                            <p className="mt-3 ml-0 text-sm text-red-500">
                                                {errors.apartment_id}
                                            </p>
                                        )}
                                        <CustomInput
                                            label="Nama Tower Apartemen"
                                            id="tower_name"
                                            value={data.tower_name}
                                            onChange={(e) =>
                                                setData(
                                                    "tower_name",
                                                    e.target.value
                                                )
                                            }
                                            errors={errors.tower_name}
                                            className="tablet:mt-8"
                                        />
                                        <CustomInput
                                            type="number"
                                            label="Total Unit"
                                            id="total_room"
                                            value={data.total_room}
                                            onChange={(e) =>
                                                setData(
                                                    "total_room",
                                                    e.target.value
                                                )
                                            }
                                            errors={errors.total_room}
                                            className="tablet:mt-8"
                                        />
                                    </div>
                                    <div className="flex flex-row mt-8">
                                        <div className="flex gap-4 ml-0 w-max">
                                            <Button
                                                variant="filled"
                                                onClick={handleSubmit}
                                                className="bg-green-500"
                                                loading={processing}
                                            >
                                                Tambah Data
                                            </Button>
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

export default AddApartmentTower;
