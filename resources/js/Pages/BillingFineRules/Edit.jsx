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
    Option,
    Select,
} from "@material-tailwind/react";
import { useState } from "react";
import { formatNumberWithDots, unformatNumberFromDots } from "@/utils/helper";
import { TypeBilling } from "@/utils/constant";

const EditBillingFineRules = ({
    auth,
    apartmentData,
    apartmentId,
    fineRulesData,
    apartmentName,
}) => {
    const role = auth.user.role;

    const { data, setData, post, processing, errors } = useForm({
        fine_rate_per_day: fineRulesData.fine_rate_per_day
            ? fineRulesData.fine_rate_per_day
            : 0,
        billing_type: fineRulesData.billing_type,
        max_fine: fineRulesData.max_fine ? fineRulesData.max_fine : 0,
        percentage:
            fineRulesData.percentage * 100 ? fineRulesData.percentage * 100 : 0,
        due_date: fineRulesData.due_date ? fineRulesData.due_date : 0,
        apartment_id:
            role === "SUPER ADMIN" ? fineRulesData.apartment_id : apartmentId,
    });

    const initialApartment = apartmentData.find(
        (apartment) => apartment.value === fineRulesData.apartment_id
    );

    const [apartment, setApartment] = useState(initialApartment);
    const [billingType, setBillingType] = useState(fineRulesData.billing_type);

    const dataID = fineRulesData.id;

    const handleApartmentChange = (value) => {
        setApartment(value);
        setData((prevValues) => ({
            ...prevValues,
            apartment_id: value.value,
        }));
    };

    const handleBillingTypeChange = (value) => {
        setBillingType(value);
        setData((prevValues) => ({
            ...prevValues,
            billing_type: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(`/billing-fine-rules/${dataID}/update`);
    };
    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Aturan Denda
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
                            href={route("billingFineRules.index")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Aturan Denda
                        </Link>
                        <Link
                            href={route("billingFineRules.add")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Edit
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                title={"Edit Aturan Denda Baru"}
                                description={"Edit Informasi Ketentuan Denda"}
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
                                                value={billingType}
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
                                            label="Denda /hari"
                                            id="fine_rate_per_day"
                                            value={formatNumberWithDots(
                                                data.fine_rate_per_day
                                            )}
                                            onChange={(e) =>
                                                setData(
                                                    "fine_rate_per_day",
                                                    unformatNumberFromDots(
                                                        e.target.value
                                                    )
                                                )
                                            }
                                            errors={errors.fine_rate_per_day}
                                            className="tablet:mt-8"
                                        />
                                        <CustomInput
                                            label="Maksimal Denda"
                                            id="max_fine"
                                            value={formatNumberWithDots(
                                                data.max_fine
                                            )}
                                            onChange={(e) =>
                                                setData(
                                                    "max_fine",
                                                    unformatNumberFromDots(
                                                        e.target.value
                                                    )
                                                )
                                            }
                                            errors={errors.max_fine}
                                            className="tablet:mt-8"
                                        />
                                    </div>
                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                        <CustomInput
                                            type="number"
                                            label="Denda dalam Persentase"
                                            id="percentage"
                                            value={data.percentage}
                                            onChange={(e) =>
                                                setData(
                                                    "percentage",
                                                    e.target.value
                                                )
                                            }
                                            errors={errors.percentage}
                                            className="tablet:mt-8"
                                        />
                                        <CustomInput
                                            type="number"
                                            label="Lama Jatuh Tempo satuan Hari"
                                            id="due_date"
                                            value={data.due_date}
                                            onChange={(e) =>
                                                setData(
                                                    "due_date",
                                                    e.target.value
                                                )
                                            }
                                            errors={errors.due_date}
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
};

export default EditBillingFineRules;
