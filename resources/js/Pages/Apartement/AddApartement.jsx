import CustomInput from "@/Components/CustomInput";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import InputUpload from "@/Components/InputUpload";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import {
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Input,
} from "@material-tailwind/react";

export default function AddApartement({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: "",
        address: "",
        total_room: "",
        logo_company: null,
    });

    // ! Handle submit
    function handleSubmit(e) {
        e.preventDefault();
        post("/apartement/store");
    }

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Tambah Apartemen
                </h2>
            }
        >
            <Head title="Tambah Apartemen" />

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
                            href={route("apartement.index")}
                            className="opacity-60 text-primaryHover "
                        >
                            Apartemen
                        </Link>
                        <Link
                            href={route("apartement.add")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Tambah Apartemen
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                title={"Data Apartemen Baru"}
                                description={
                                    "Tambah Informasi Apartemen yang Baru"
                                }
                                label="Cari Nama Apartemen"
                                showSearch={false}
                            />
                            <CardBody className="h-full px-0 ">
                                <form onSubmit={handleSubmit}>
                                    <div className="flex flex-row justify-start tablet:flex-col">
                                        <CustomInput
                                            label="Nama Apartemen"
                                            id="name"
                                            value={data.name}
                                            onChange={(e) =>
                                                setData("name", e.target.value)
                                            }
                                            errors={errors.name}
                                        />

                                        <CustomInput
                                            label="Alamat"
                                            id="address"
                                            value={data.address}
                                            onChange={(e) =>
                                                setData(
                                                    "address",
                                                    e.target.value
                                                )
                                            }
                                            errors={errors.address}
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
                                    <div className="mt-8 mr-4 tablet:mr-0">
                                        <InputUpload
                                            className="tablet:mt-8"
                                            onChange={(file) =>
                                                setData("logo_company", file)
                                            }
                                            errors={errors.logo_company}
                                            currentImage={data.logo_company}
                                        />
                                    </div>
                                    <div className="flex flex-row mt-8">
                                        <div className="flex gap-4 ml-0 w-max">
                                            <Button
                                                variant="fill"
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
}
