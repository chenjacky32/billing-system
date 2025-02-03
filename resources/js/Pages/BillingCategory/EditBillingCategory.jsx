import CustomInput from "@/Components/CustomInput";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { TypeBilling } from "@/utils/constant";
import InputSelect from "@/Components/InputSelect";
import {
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Option,
    Select,
} from "@material-tailwind/react";
import { useState } from "react";

export default function EditBillingCategory({
    auth,
    apartmentData,
    billingCategoryData,
    apartmentId,
    apartmentName,
}) {
    const role = auth.user.role;

    const { data, setData, post, processing, errors } = useForm({
        billing_type: billingCategoryData.billing_type,
        category_name: billingCategoryData.category_name,
        unit_price: billingCategoryData.unit_price,
        apartment_id:
            role === "SUPER ADMIN"
                ? billingCategoryData.apartment_id
                : apartmentId,
    });

    const initialApartment = apartmentData.find(
        (apartment) => apartment.value === billingCategoryData.apartment_id
    );
    const dataID = billingCategoryData.id;
    const [apartment, setApartment] = useState(initialApartment);

    const handleApartmentChange = (value) => {
        setApartment(value);
        setData((prevValues) => ({
            ...prevValues,
            apartment_id: value.value,
        }));
    };

    const handleBillingTypeChange = (value) => {
        setData((prevValues) => ({
            ...prevValues,
            billing_type: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/billing-category/${dataID}/update`);
    };
    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Add Billing Category
                </h2>
            }
        >
            <Head title="Add Billing Category" />

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
                            href={route("billingCategory.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Billing Category
                        </Link>
                        <Link
                            href={route("billingCategory.edit", {
                                id: dataID,
                            })}
                            className="font-bold opacity-100 text-primary"
                        >
                            Edit
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>

                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                title={"New Category Billing"}
                                description={
                                    "Tambah Informasi Kategori Tagihan yang Baru"
                                }
                                label="Cari Nama Kategori Tagihan yang Baru"
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
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Select
                                                label="Tipe Billing"
                                                id="billing_type"
                                                color="blue"
                                                value={data.billing_type}
                                                onChange={
                                                    handleBillingTypeChange
                                                }
                                            >
                                                {TypeBilling.map(
                                                    (item, index) => (
                                                        <Option
                                                            key={index}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </Option>
                                                    )
                                                )}
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                        <CustomInput
                                            label="Nama Kategori Tagihan"
                                            id="category_name"
                                            value={data.category_name}
                                            onChange={(e) =>
                                                setData(
                                                    "category_name",
                                                    e.target.value
                                                )
                                            }
                                            errors={errors.category_name}
                                            className="tablet:mt-8"
                                        />
                                        <CustomInput
                                            type="number"
                                            label="Tarif / Harga"
                                            id="unit_price"
                                            value={data.unit_price}
                                            onChange={(e) =>
                                                setData(
                                                    "unit_price",
                                                    e.target.value
                                                )
                                            }
                                            errors={errors.unit_price}
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
        </AuthenticatedLayout>
    );
}
