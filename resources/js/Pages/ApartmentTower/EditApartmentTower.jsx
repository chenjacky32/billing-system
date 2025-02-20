import CustomInput from "@/Components/CustomInput";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import {
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Input,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import InputSelect from "@/Components/InputSelect";

const EditApartmentTower = ({
    apartmentTowerData,
    apartmentData,
    apartmentId,
    apartmentName,
    auth,
}) => {
    const { data, setData, post, processing, errors } = useForm({
        tower_name: apartmentTowerData.tower_name,
        total_room: apartmentTowerData.total_room,
        apartment_id: apartmentTowerData.apartment_id,
    });

    const { flash } = usePage().props;

    const initialApartment = apartmentData.find(
        (apartment) => apartment.value === apartmentTowerData.apartment_id
    );

    const dataID = apartmentTowerData.id;
    const role = auth.user.role;
    const [apartment, setApartment] = useState(initialApartment);

    const handleApartmentChange = (value) => {
        setApartment(value);
        setData((prevValues) => ({
            ...prevValues,
            apartment_id: value.value,
        }));
    };

    // ! Handle submit
    function handleSubmit(e) {
        e.preventDefault();
        post(`/apartement-tower/${dataID}/update`);
    }

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
                    Edit Apartment Tower
                </h2>
            }
        >
            <Head title="Edit Apartment" />
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
                            className="opacity-60 text-primaryHover"
                        >
                            Apartment Tower
                        </Link>
                        <Link
                            href={route("apartementTower.edit", { id: dataID })}
                            className="font-bold opacity-100 text-primary"
                        >
                            Edit
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                title={"Edit Apartement Data"}
                                description={"Edit Informasi Apartemen"}
                                label="Cari Nama Apartemen"
                                showSearch={false}
                            />
                            <CardBody className="h-full px-0 ">
                                <form onSubmit={handleSubmit}>
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
                                            label="Nama Tower"
                                            id="address"
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
                                            label="Total Kamar"
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
                                                Edit Data
                                            </Button>
                                        </div>
                                    </div>
                                </form>
                            </CardBody>
                        </Card>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </AuthenticatedLayout>
    );
};

export default EditApartmentTower;
