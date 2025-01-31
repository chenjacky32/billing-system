import CustomInput from "@/Components/CustomInput";
import InputSelect from "@/Components/InputSelect";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { TypeBilling } from "@/utils/constant";
import { TrashIcon } from "@heroicons/react/24/solid";
import {
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Input,
    Option,
    Select,
    Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";

export default function Edit({
    auth,
    ownerData,
    billingData,
    billingCategory,
}) {
    const [owner, setOwner] = useState(
        ownerData.find((item) => item.value === billingData.owner_id)
    );
    const [billingType, setBillingType] = useState(billingData.billing_type);
    const [status, setStatus] = useState(billingData.status);
    const [maintenanceTypeSelected, setMaintenanceTypeSelected] = useState(
        billingData.billing_category_id?.toString() || ""
    );
    const [vehicleTypeSelected, setVehicleTypeSelected] = useState(
        billingData.billing_category_id?.toString() || ""
    );

    const { flash } = usePage().props;
    const [isLoading, setIsLoading] = useState(null);
    const { data, setData, post, processing, errors } = useForm({
        start_meter: billingData.start_meter,
        end_meter: billingData.end_meter,
        unit_price: billingData.unit_price,
        minimum_charge: billingData.minimum_charge,
        billing_fee: billingData.billing_fee || flash?.billing_fee,
        maintenance_type: maintenanceTypeSelected,
        vehicle_type_parking: vehicleTypeSelected,
        meter_reading: billingData.meter_reading || flash?.meter_reading,
        billing_date: billingData.billing_date,
        billing_type: billingData.billing_type,
        status: billingData.status,
        paid_date: billingData.paid_date,
        owner_id: billingData.owner_id,
        fine: billingData.fine,
        due_date: billingData.due_date,
    });

    useEffect(() => {
        if (flash?.billing_fee || flash?.meter_reading) {
            setData((prevValues) => ({
                ...prevValues,
                billing_fee: flash.billing_fee,
                meter_reading: flash.meter_reading,
            }));
        }
    }, [flash?.billing_fee, flash?.meter_reading]);

    function handleCountBilling(e) {
        e.preventDefault();
        setIsLoading("count-billing");
        post(route("billing.count"), {
            preserveScroll: true,
            onFinish: () => setIsLoading(null),
        });
    }

    const getOptionsForType = (type) => {
        const filteredCategory = billingCategory.find(
            (category) => category.billing_type === type
        );
        return filteredCategory ? filteredCategory.categories : [];
    };

    const maintenanceOptions = getOptionsForType("Maintenance");
    const vehicleOptions = getOptionsForType("Parkir");

    const handleChangeMaintenanceType = (value) => {
        setMaintenanceTypeSelected(value);
        setData((prevValues) => ({
            ...prevValues,
            maintenance_type: value,
        }));
    };

    const handleChangeVehicleType = (value) => {
        setVehicleTypeSelected(value);
        setData((prevValues) => ({
            ...prevValues,
            vehicle_type_parking: value,
        }));
    };

    const handleStatusChange = (value) => {
        setStatus(value);
        if (status === "Cancel" || status === "Pending") {
            data.paid_date = "";
        } else if (status === "Success") {
            data.paid_date = billingData.paid_date;
        }
        setData((prevValues) => ({
            ...prevValues,
            status: value,
        }));
    };
    const handleOwnerChangeChange = (value) => {
        setOwner(value);
        setData((prevValues) => ({
            ...prevValues,
            owner_id: value.value,
        }));
    };

    const handleBillingTypeChange = (value) => {
        setBillingType(value);
        setData((prevValues) => ({
            ...prevValues,
            billing_type: value,
            meter_reading: null,
        }));
    };

    const dataID = billingData.id;

    // ! Handle submit
    function handleSubmit(e) {
        e.preventDefault();
        setIsLoading("edit-billing");
        // console.warn(data);
        post(`/billing/${dataID}/update`, {
            onFinish: () => setIsLoading(null),
        });
    }

    // ! Handle Clear Count Billing
    function handleClearCountBilling() {
        if (billingType === "Listrik") {
            setData((prevValues) => ({
                ...prevValues,
                start_meter: "",
                end_meter: "",
                meter_reading: "",
                unit_price: "",
                minimum_charge: "",
                billing_fee: "",
            }));
        } else if (billingType === "Maintenance" || billingType === "Parkir") {
            setData((prevValues) => ({
                ...prevValues,
                meter_reading: null,
                billing_fee: "",
                maintenance_type: "",
                vehicle_type_parking: "",
            }));
            setMaintenanceTypeSelected("");
            setVehicleTypeSelected("");
        }
    }

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Edit Billing Data
                </h2>
            }
        >
            <Head title="Edit Billing Data" />

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
                            href={route("billing.index")}
                            className="opacity-60 text-primaryHover "
                        >
                            Billing
                        </Link>
                        <Link
                            href={route("billing.edit", {
                                id: dataID,
                            })}
                            className="font-bold opacity-100 text-primary"
                        >
                            Edit Billing
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-fit">
                        <Card className="w-full h-full p-12 ">
                            <div className="w-full h-fit">
                                <PageHeader
                                    title={"Edit Billing Data"}
                                    description={
                                        "Edit Tagihan Billing Unit Owner"
                                    }
                                    showSearch={false}
                                />
                            </div>
                            <CardBody className="h-full px-0 ">
                                <form onSubmit={handleSubmit}>
                                    <div className="flex flex-row justify-start tablet:flex-col ">
                                        <div className="flex flex-col w-full mr-4">
                                            <InputSelect
                                                value={owner}
                                                onChange={
                                                    handleOwnerChangeChange
                                                }
                                                options={ownerData}
                                            />
                                            {errors.owner_id && (
                                                <p className="mt-3 ml-0 text-sm text-red-500">
                                                    {errors.owner_id}
                                                </p>
                                            )}
                                        </div>

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
                                        {billingType === "Air" && (
                                            <CustomInput
                                                label="Meteran"
                                                id="meter_reading"
                                                value={data.meter_reading || ""}
                                                onChange={(e) =>
                                                    setData(
                                                        "meter_reading",
                                                        e.target.value
                                                    )
                                                }
                                                errors={errors.meter_reading}
                                                className="tablet:mt-8"
                                                type="number"
                                            />
                                        )}
                                        {/* Tagihan Listrik */}
                                        {billingType === "Listrik" && (
                                            <div className="flex flex-row justify-start w-full tablet:flex-col tablet:mt-8">
                                                <div className="w-full mr-4">
                                                    <CustomInput
                                                        label="Meteran Awal"
                                                        id="start_meter"
                                                        value={
                                                            data.start_meter ||
                                                            ""
                                                        }
                                                        onChange={(e) => {
                                                            setData(
                                                                "start_meter",
                                                                e.target.value
                                                            );
                                                        }}
                                                        type="number"
                                                        errors={
                                                            errors.start_meter
                                                        }
                                                    />
                                                </div>
                                                <div className="w-full mr-4 tablet:mt-8">
                                                    <CustomInput
                                                        label="Meteran Akhir"
                                                        id="end_meter"
                                                        value={
                                                            data.end_meter || ""
                                                        }
                                                        onChange={(e) => {
                                                            setData(
                                                                "end_meter",
                                                                e.target.value
                                                            );
                                                        }}
                                                        type="number"
                                                        errors={
                                                            errors.end_meter
                                                        }
                                                    />
                                                </div>
                                                <div className="w-full mr-4 tablet:mt-8">
                                                    <CustomInput
                                                        disabled={true}
                                                        label="Total Meteran"
                                                        id="meter_reading"
                                                        value={
                                                            data.meter_reading ||
                                                            ""
                                                        }
                                                        type="number"
                                                        errors={
                                                            errors.meter_reading
                                                        }
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {billingType === "Listrik" ? (
                                        <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
                                            <div className="w-full mr-4 tablet:mt-8">
                                                <CustomInput
                                                    label="Harga / KWh"
                                                    id="unit_price"
                                                    value={
                                                        data.unit_price || ""
                                                    }
                                                    onChange={(e) =>
                                                        setData(
                                                            "unit_price",
                                                            e.target.value
                                                        )
                                                    }
                                                    type="number"
                                                    errors={errors.unit_price}
                                                />
                                            </div>
                                            <div className="w-full mr-4 tablet:mt-8">
                                                <CustomInput
                                                    label="Minimum Charge"
                                                    id="minimum_charge"
                                                    value={
                                                        data.minimum_charge ||
                                                        ""
                                                    }
                                                    type="number"
                                                    onChange={(e) =>
                                                        setData(
                                                            "minimum_charge",
                                                            e.target.value
                                                        )
                                                    }
                                                    errors={
                                                        errors.minimum_charge
                                                    }
                                                ></CustomInput>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div
                                        className={`flex flex-row justify-start tablet:flex-col 
                                            ${
                                                billingType === "Listrik" ||
                                                billingType === "Air"
                                                    ? "mt-8"
                                                    : "mt-0 tablet:mt-8"
                                            } `}
                                    >
                                        {billingType === "Maintenance" && (
                                            <div className="w-full mr-4 tablet:mb-8">
                                                <Select
                                                    label="Jenis Maintenance"
                                                    id="maintenance_type"
                                                    value={
                                                        maintenanceTypeSelected
                                                    }
                                                    onChange={
                                                        handleChangeMaintenanceType
                                                    }
                                                    errors={
                                                        errors.maintenance_type
                                                    }
                                                >
                                                    {maintenanceOptions.map(
                                                        (items, index) => {
                                                            return (
                                                                <Option
                                                                    key={index}
                                                                    value={items.value.toString()}
                                                                >
                                                                    {`${items.label}`}
                                                                </Option>
                                                            );
                                                        }
                                                    )}
                                                </Select>
                                            </div>
                                        )}

                                        {billingType === "Parkir" && (
                                            <div className="w-full mr-4 tablet:mb-8">
                                                <Select
                                                    label="Jenis Kendaraan"
                                                    id="vehicle_type"
                                                    value={vehicleTypeSelected}
                                                    onChange={
                                                        handleChangeVehicleType
                                                    }
                                                >
                                                    {vehicleOptions.map(
                                                        (items, index) => {
                                                            return (
                                                                <Option
                                                                    key={index}
                                                                    value={items.value.toString()}
                                                                >
                                                                    {
                                                                        items.label
                                                                    }
                                                                </Option>
                                                            );
                                                        }
                                                    )}
                                                </Select>
                                            </div>
                                        )}
                                        <div className="w-full mr-4">
                                            {billingType === "Listrik" ? (
                                                <Typography
                                                    variant="paragraph"
                                                    className="mb-2 text-base font-semibold "
                                                >
                                                    Total Tagihan
                                                </Typography>
                                            ) : null}
                                            <CustomInput
                                                label="Biaya Tagihan"
                                                id="billing_fee"
                                                value={data.billing_fee || ""}
                                                type="number"
                                                {...(data.billing_type ===
                                                "Listrik"
                                                    ? { disabled: true }
                                                    : {
                                                          onChange: (e) =>
                                                              setData(
                                                                  "billing_fee",
                                                                  e.target.value
                                                              ),
                                                      })}
                                                errors={errors.billing_fee}
                                            />
                                        </div>
                                    </div>
                                    {billingType === "Listrik" ||
                                    billingType === "Maintenance" ||
                                    billingType === "Parkir" ? (
                                        <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
                                            <div className="mr-4 w-fit tablet:mt-8">
                                                <Button
                                                    variant="filled"
                                                    onClick={handleCountBilling}
                                                    className="bg-orange-500"
                                                    loading={
                                                        isLoading ===
                                                        "count-billing"
                                                    }
                                                >
                                                    Hitung Tagihan
                                                </Button>
                                            </div>
                                            <div className="mr-4 w-fit tablet:mt-8">
                                                <Button
                                                    variant="filled"
                                                    onClick={
                                                        handleClearCountBilling
                                                    }
                                                    className="flex items-center justify-center gap-2 bg-red-600 "
                                                >
                                                    <TrashIcon className="w-4 h-4" />{" "}
                                                    <span>Clear</span>
                                                </Button>
                                            </div>
                                        </div>
                                    ) : null}

                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                        <CustomInput
                                            label="Tanggal Tagihan Dibuat"
                                            id="billing_date"
                                            value={data.billing_date}
                                            onChange={(e) =>
                                                setData(
                                                    "billing_date",
                                                    e.target.value
                                                )
                                            }
                                            errors={errors.billing_date}
                                            className="tablet:mt-8"
                                            type="date"
                                        />
                                        <CustomInput
                                            label="Tanggal Batas Pembayaran"
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
                                            type="date"
                                        />

                                        <CustomInput
                                            label="Biaya Denda Jika Lewat Batas Tagihan"
                                            id="fine"
                                            value={data.fine}
                                            onChange={(e) =>
                                                setData("fine", e.target.value)
                                            }
                                            type="number"
                                            errors={errors.fine}
                                            className="tablet:mt-8"
                                        />
                                    </div>
                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Select
                                                label="Status Pembayaran"
                                                id="status"
                                                color="blue"
                                                value={status}
                                                onChange={handleStatusChange}
                                            >
                                                <Option value="Pending">
                                                    Pending
                                                </Option>
                                                <Option value="Success">
                                                    Success
                                                </Option>
                                                <Option value="Cancel">
                                                    Cancel
                                                </Option>
                                            </Select>
                                            {errors.status && (
                                                <p className="mt-3 ml-0 text-sm text-red-500">
                                                    {errors.status}
                                                </p>
                                            )}
                                        </div>

                                        {status === "Success" && (
                                            <div className="flex flex-col w-full mr-4">
                                                <CustomInput
                                                    label="Tanggal Pembayaran"
                                                    id="paid_date"
                                                    value={data.paid_date}
                                                    onChange={(e) =>
                                                        setData(
                                                            "paid_date",
                                                            e.target.value
                                                        )
                                                    }
                                                    errors={errors.paid_date}
                                                    className="tablet:mt-8"
                                                    type="date"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-row mt-8">
                                        <div className="flex gap-4 ml-0 w-max">
                                            <Button
                                                variant="filled"
                                                onClick={handleSubmit}
                                                className="bg-green-500"
                                                loading={
                                                    isLoading === "edit-billing"
                                                }
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
