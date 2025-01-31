import CustomInput from "@/Components/CustomInput";
import InputSelect from "@/Components/InputSelect";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { TrashIcon } from "@heroicons/react/24/solid";
import { Head, Link, useForm, usePage } from "@inertiajs/react";
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
import { TypeBilling } from "@/utils/constant";

export default function AddBiling({ auth, ownerData, billingCategory }) {
    const [owner, setOwner] = useState(ownerData[0]);
    const [billingType, setBillingType] = useState("Air");
    const [maintenanceTypeSelected, setMaintenanceTypeSelected] = useState("");
    const [vehicleTypeSelected, setVehicleTypeSelected] = useState("");
    const [isLoading, setIsLoading] = useState(null);
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        billing_fee: flash?.billing_fee || "",
        meter_reading: flash?.meter_reading || "",
        billing_date: "",
        billing_type: billingType,
        fine: "",
        minimum_charge: "",
        due_date: "",
        start_meter: "",
        end_meter: "",
        unit_price: "",
        maintenance_type: maintenanceTypeSelected,
        vehicle_type_parking: vehicleTypeSelected,
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

    //handle for filter option select category
    const getOptionsForType = (type) => {
        const filteredCategory = billingCategory.find(
            (category) => category.billing_type === type
        );
        return filteredCategory ? filteredCategory.categories : [];
    };

    const maintenanceOptions = getOptionsForType("Maintenance");
    const vehicleOptions = getOptionsForType("Parkir");

    const handleChangeVehicleType = (value) => {
        setVehicleTypeSelected(value);
        setData((prevValues) => ({
            ...prevValues,
            vehicle_type_parking: value,
        }));
    };

    const handleChangeMaintenanceType = (value) => {
        setMaintenanceTypeSelected(value);
        setData((prevValues) => ({
            ...prevValues,
            maintenance_type: value,
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
            billing_fee: "",
        }));
    };

    // ! Handle submit
    function handleSubmit(e) {
        e.preventDefault();
        setIsLoading("add-billing");
        // console.warn(data);
        post("/billing/store", {
            onFinish: () => setIsLoading(null),
        });
    }

    // ! Handle Count Billing
    function handleCountBilling(e) {
        e.preventDefault();
        setIsLoading("count-billing");
        post(route("billing.count"), {
            preserveScroll: true,
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
                    Add Billing Data
                </h2>
            }
        >
            <Head title="Add Billing Data" />

            <div className="py-12">
                <div className="max-w-1xl mx-auto sm:px-6 lg:px-8 w-full h-[35rem] tablet:h-[55rem] ">
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
                            href={route("billing.add")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Add Billing
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-fit">
                        <Card className="w-full h-full p-12">
                            <div className="w-full h-fit">
                                <PageHeader
                                    title={"New Billing Data"}
                                    description={
                                        "Tambah Tagihan Billing yang Baru"
                                    }
                                    showSearch={false}
                                    className
                                />
                            </div>
                            <CardBody className="h-full px-0">
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
                                    <div className="flex flex-row mt-8">
                                        <div className="flex gap-4 ml-0 w-max">
                                            <Button
                                                variant="filled"
                                                onClick={handleSubmit}
                                                className="bg-green-500"
                                                loading={
                                                    isLoading === "add-billing"
                                                }
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
