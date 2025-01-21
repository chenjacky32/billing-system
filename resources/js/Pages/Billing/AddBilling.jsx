import CustomInput from "@/Components/CustomInput";
import InputSelect from "@/Components/InputSelect";
import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, useForm } from "@inertiajs/react";
import {
    Breadcrumbs,
    Button,
    Card,
    CardBody,
    Input,
    Option,
    Select,
} from "@material-tailwind/react";
import { useEffect, useMemo, useState, useCallback } from "react";

export default function AddBiling({ auth, ownerData }) {
    const [owner, setOwner] = useState(ownerData[0]);
    const [billingType, setBillingType] = useState("Air");

    const { data, setData, post, processing, errors } = useForm({
        billing_fee: "",
        meter_reading: "",
        billing_date: "",
        billing_type: billingType,
        fine: "",
        due_date: "",
        meter_reading_start: "",
        meter_reading_end: "",
        price_per_kwh: "",
    });

    useEffect(() => {
        updateMeterReadingDiff();
        console.log("rerender useEffect");
    }, [data.meter_reading_start, data.meter_reading_end]);

    useEffect(() => {
        countTotalsBilling();
    }, [data.price_per_kwh, data.meter_reading]);

    const updateMeterReadingDiff = () => {
        const start = Number(data.meter_reading_start) || 0;
        const end = Number(data.meter_reading_end) || 0;
        const diff = start == end ? start : start - end;

        setData("meter_reading", diff); // Perbarui state
    };

    const countTotalsBilling = useCallback(() => {
        const pricePerKwh = Number(data.price_per_kwh) || 0;
        const totals =
            data.meter_reading && pricePerKwh
                ? Number(data.meter_reading) * pricePerKwh
                : 0;

        setData("billing_fee", totals);
        console.log("useCallback");
    }, [data.meter_reading, data.price_per_kwh]);

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

    // ! Handle submit
    function handleSubmit(e) {
        e.preventDefault();
        // console.warn(data);
        post("/billing/store");
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
                            href={route("billing.add")}
                            className="font-bold opacity-100 text-primary"
                        >
                            Add Billing
                        </Link>
                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <Card className="w-full h-full p-12 ">
                            <PageHeader
                                title={"New Billing Data"}
                                description={"Tambah Tagihan Billing yang Baru"}
                                showSearch={false}
                            />
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
                                                <Option value="Air">Air</Option>
                                                <Option value="Listrik">
                                                    Listrik
                                                </Option>
                                                <Option value="Maintenance">
                                                    Maintenance
                                                </Option>
                                                <Option value="Parkir">
                                                    Parkir
                                                </Option>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* tagihan listrik */}
                                    {billingType === "Listrik" && (
                                        <>
                                            <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                                <CustomInput
                                                    label="Meteran Awal"
                                                    id="meter_reading_start"
                                                    value={
                                                        data.meter_reading_start
                                                    }
                                                    onChange={(e) => {
                                                        setData(
                                                            "meter_reading_start",
                                                            e.target.value
                                                        );
                                                    }}
                                                    type="number"
                                                    errors={
                                                        errors.meter_reading_start
                                                    }
                                                />
                                                <CustomInput
                                                    label="Meteran Akhir"
                                                    id="meter_reading_end"
                                                    value={
                                                        data.meter_reading_end
                                                    }
                                                    onChange={(e) => {
                                                        setData(
                                                            "meter_reading_end",
                                                            e.target.value
                                                        );
                                                    }}
                                                    type="number"
                                                    errors={
                                                        errors.meter_reading_end
                                                    }
                                                />
                                                <CustomInput
                                                    disabled={true}
                                                    label="Total Meteran"
                                                    id="meter_reading"
                                                    value={data.meter_reading}
                                                    type="number"
                                                    errors={
                                                        errors.meter_reading
                                                    }
                                                />
                                                <CustomInput
                                                    label="Harga / KWh"
                                                    id="price_per_kwh"
                                                    value={data.price_per_kwh}
                                                    onChange={(e) =>
                                                        setData(
                                                            "price_per_kwh",
                                                            e.target.value
                                                        )
                                                    }
                                                    type="number"
                                                    errors={
                                                        errors.price_per_kwh
                                                    }
                                                />
                                            </div>
                                        </>
                                    )}

                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col">
                                        <CustomInput
                                            label="Biaya Tagihan"
                                            id="billing_fee"
                                            value={data.billing_fee}
                                            type="number"
                                            {...(data.billing_type === "Listrik"
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

                                        {billingType === "Air" && (
                                            <CustomInput
                                                label="Meteran"
                                                id="meter_reading"
                                                value={data.meter_reading}
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
                                    </div>

                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
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
