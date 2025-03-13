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
    Option,
    Select,
    Typography,
} from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { TypeBilling } from "@/utils/constant";
import CustomDatePicker from "@/Components/CustomDatePicker";
import dayjs from "dayjs";

export default function AddBiling({
    auth,
    ownerData,
    billingCategory,
    roomNumber,
    towerData,
    // residenceData,
    WaterPriceData,
    WaterPriceMinimumCharge,
    waterPriceId,
    apartmentId,
    billingDueDays,
}) {
    const mappedRoomNumber = roomNumber.map((number) => ({
        ...number,
        label: `Nomor - ${number.label}`,
    }));

    // const [owner, setOwner] = useState(ownerData[0]);
    const [room, setRoom] = useState(mappedRoomNumber[0]);
    const [tower, setTower] = useState(towerData[0]);
    const [residence, setResidence] = useState("");
    const [billingType, setBillingType] = useState("Air");
    const [waterTypeSelected, setWaterTypeSelected] = useState("");
    const [electricTypeSelected, setElectricTypeSelected] = useState("");
    const [maintenanceTypeSelected, setMaintenanceTypeSelected] = useState("");
    const [vehicleTypeSelected, setVehicleTypeSelected] = useState("");
    const [isLoading, setIsLoading] = useState(null);
    const { flash } = usePage().props;

    const { data, setData, post, processing, errors } = useForm({
        billing_fee: flash?.billing_fee || "",
        total_amount: flash?.total_amount || "",
        meter_reading: flash?.meter_reading || "",
        billing_date: "",
        due_days: 10,
        billing_type: billingType,
        fine: flash?.fine || "",
        minimum_charge: "",
        due_date: "",
        apartment_id: apartmentId,
        start_meter: "",
        end_meter: "",
        // residence_id: "",
        unit_price: "",
        period: null,
        tower_id: "",
        water_type: waterPriceId || "",
        electric_type: electricTypeSelected,
        maintenance_type: maintenanceTypeSelected,
        vehicle_type_parking: vehicleTypeSelected,
    });

    console.log(data.period);
    // console.log(data.fine);
    // console.log(flash);
    // console.log("useState", {
    //     room: room,
    //     tower: tower,
    //     residence: residence,
    //     billingType: billingType,
    //     waterTypeSelected: waterTypeSelected,
    //     electricTypeSelected: electricTypeSelected,
    //     maintenanceTypeSelected: maintenanceTypeSelected,
    //     maintenanceTypeSelected: maintenanceTypeSelected,
    //     isLoading: isLoading,
    // });
    // console.log("useForm State", data);

    const role = auth.user.role;

    function formattedDate(date) {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    useEffect(() => {
        if (flash?.billing_fee || flash?.meter_reading || flash?.fine) {
            setData((prevValues) => ({
                ...prevValues,
                billing_fee: flash.billing_fee,
                meter_reading: flash.meter_reading,
                fine: flash.fine,
                total_amount: flash.total_amount,
            }));
        }
    }, [
        flash?.billing_fee,
        flash?.meter_reading,
        flash?.fine,
        flash?.total_amount,
    ]);

    useEffect(() => {
        if (billingType === "Air" && WaterPriceData) {
            setData((prevValues) => ({
                ...prevValues,
                unit_price: WaterPriceData ?? 0,
                minimum_charge: WaterPriceMinimumCharge ?? 0,
            }));
        }
    }, [billingType, WaterPriceData, WaterPriceMinimumCharge]);

    const handleChangeBillingDate = (value) => {
        setData((prevValues) => {
            const billingDate = dayjs(value);
            const dueDate = billingDate
                .add(prevValues.due_days, "day")
                .format("YYYY-MM-DD");

            return {
                ...prevValues,
                billing_date: value,
                due_date: dueDate,
            };
        });
    };

    const handleChangePeriod = (value) => {
        const firstDate = value.date(1);
        setData((prevValues) => ({
            ...prevValues,
            period: formattedDate(firstDate.$d),
        }));
    };

    //handle for filter option select category
    const getOptionsForType = (type) => {
        const filteredCategory = billingCategory.find(
            (category) => category.billing_type === type
        );
        return filteredCategory ? filteredCategory.categories : [];
    };

    const maintenanceOptions = getOptionsForType("Maintenance");
    const vehicleOptions = getOptionsForType("Parkir");
    const electricOptions = getOptionsForType("Listrik");
    const waterOptions = getOptionsForType("Air");

    const handleChangeWater = (value) => {
        setWaterTypeSelected(value);
        const findBilling = billingCategory.find(
            (type) => type.billing_type === "Air"
        );
        const findCategory = findBilling?.categories.find(
            (items) => items.value == value
        );
        setData((prevValues) => ({
            ...prevValues,
            water_type: value,
            unit_price: findCategory?.price,
            minimum_charge: findCategory?.minimum_charge,
        }));
    };

    const handleElectricChange = (value) => {
        setElectricTypeSelected(value);
        const findBilling = billingCategory.find(
            (type) => type.billing_type === "Listrik"
        );
        const findCategory = findBilling?.categories.find(
            (items) => items.value == value
        );

        setData((prevValues) => ({
            ...prevValues,
            electric_type: value,
            unit_price: findCategory?.price,
            minimum_charge: findCategory?.minimum_charge,
        }));
    };

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

    // const handleOwnerChangeChange = (value) => {
    //     setOwner(value);
    //     setData((prevValues) => ({
    //         ...prevValues,
    //         owner_id: value.value,
    //     }));
    // };

    const handleRoomChange = (value) => {
        setRoom(value);
        const findOwnerTower = towerData.find(
            (item) => item.value == value.apartmentTowerId
        );
        setTower(findOwnerTower);
        setResidence(value.ownerName);
        setData((prevValue) => ({
            ...prevValue,
            room_no: value.value,
            tower_id: value.apartmentTowerId,
            owner_id: value.value,
        }));
    };

    const handleTowerChange = (value) => {
        setTower(value);
        setData((prevValue) => ({
            ...prevValue,
            tower_id: value.value,
        }));
    };

    const handleBillingTypeChange = (value) => {
        setBillingType(value);

        if (value === "Air" && WaterPriceData) {
            setData((prevValues) => ({
                ...prevValues,
                billing_type: value,
                unit_price: WaterPriceData,
                minimum_charge: WaterPriceMinimumCharge,
                water_type: waterPriceId,
            }));
        } else {
            setData((prevValues) => ({
                ...prevValues,
                minimum_charge: 0,
                billing_type: value,
                meter_reading: null,
                billing_fee: "",
                unit_price: "",
            }));
        }
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
        if (billingType === "Listrik" || billingType === "Air") {
            setData((prevValues) => ({
                ...prevValues,
                start_meter: "",
                end_meter: "",
                meter_reading: "",
                unit_price: "",
                minimum_charge: "",
                billing_fee: "",
                total_amount: "",
                fine: "",
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

    // const isAirOrListrik = billingType === "Air" ?  : "Harga / kWh";
    const isAirOrListrik = () => {
        if (billingType === "Air") {
            return "Harga / m3";
        } else if (billingType === "Listrik") {
            return "Harga / kWh";
        } else {
            return "Harga / Unit";
        }
    };

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
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Sub Periode Tagihan
                                            </Typography>
                                            <CustomDatePicker
                                                value={
                                                    data.period
                                                        ? dayjs(data.period)
                                                        : null
                                                }
                                                placeholderText={
                                                    "Pilih Periode Bulan"
                                                }
                                                onChange={handleChangePeriod}
                                            />
                                            {errors.period && (
                                                <p className="mt-3 ml-0 text-sm text-red-500">
                                                    {errors.period}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col">
                                        <div className="flex flex-col w-full mr-4 ">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Nama Tower
                                            </Typography>

                                            <InputSelect
                                                value={tower}
                                                onChange={handleTowerChange}
                                                options={towerData}
                                                // disabled={true}
                                            />
                                            {errors.tower_id && (
                                                <p className="mt-3 ml-0 text-sm text-red-500">
                                                    {errors.tower_id}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Nama Owner
                                            </Typography>

                                            <CustomInput
                                                value={residence}
                                                disabled={true}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col ">
                                        <div className="flex flex-col w-full mr-4">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Nomor Unit
                                            </Typography>

                                            <InputSelect
                                                value={room}
                                                onChange={handleRoomChange}
                                                options={mappedRoomNumber}
                                            />
                                            {errors.room_no && (
                                                <p className="mt-3 ml-0 text-sm text-red-500">
                                                    {errors.room_no}
                                                </p>
                                            )}
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Tipe Billing
                                            </Typography>
                                            <Select
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
                                    {role === "SUPER ADMIN" &&
                                        billingType === "Air" && (
                                            <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                                <div className="flex flex-col justify-start w-full tablet:flex-col tablet:mt-8">
                                                    <Typography
                                                        variant="paragraph"
                                                        className="mb-2 text-base font-semibold"
                                                    >
                                                        Kategori / Jenis Tagihan
                                                    </Typography>
                                                    <Select
                                                        label="Kategori / Jenis Tagihan"
                                                        id="water_type" // ID untuk water_type
                                                        onChange={
                                                            handleChangeWater
                                                        }
                                                    >
                                                        {waterOptions.map(
                                                            (items, index) => (
                                                                <Option
                                                                    key={index}
                                                                    value={items.value.toString()}
                                                                >
                                                                    {
                                                                        items.label
                                                                    }
                                                                </Option>
                                                            )
                                                        )}
                                                    </Select>
                                                    {errors.water_type && (
                                                        <p className="mt-3 ml-0 text-sm text-red-500">
                                                            {errors.water_type}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    <>
                                        <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                            <div className="flex flex-row justify-start w-full tablet:flex-col tablet:mt-8">
                                                {billingType === "Listrik" && (
                                                    <div className="w-full mr-4">
                                                        <Typography
                                                            variant="paragraph"
                                                            className="mb-2 text-base font-semibold "
                                                        >
                                                            Kategori / Jenis
                                                            Tagihan
                                                        </Typography>
                                                        <Select
                                                            label="Kategori / Jenis Tagihan"
                                                            value={
                                                                electricTypeSelected
                                                            }
                                                            id="electric_type"
                                                            onChange={
                                                                handleElectricChange
                                                            }
                                                        >
                                                            {electricOptions.map(
                                                                (
                                                                    items,
                                                                    index
                                                                ) => {
                                                                    return (
                                                                        <Option
                                                                            key={
                                                                                index
                                                                            }
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
                                                        {errors.electric_type && (
                                                            <p className="mt-3 ml-0 text-sm text-red-500">
                                                                {
                                                                    errors.electric_type
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                )}

                                                {billingType === "Listrik" ||
                                                billingType === "Air" ? (
                                                    <>
                                                        <div className="w-full mr-4 tablet:mt-8">
                                                            <Typography
                                                                variant="paragraph"
                                                                className="mb-2 text-base font-semibold "
                                                            >
                                                                Meteran Awal
                                                            </Typography>

                                                            <CustomInput
                                                                label="Meteran Awal"
                                                                id="start_meter"
                                                                value={
                                                                    data.start_meter
                                                                        ? data.start_meter
                                                                              .toString()
                                                                              .replace(
                                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                                  "."
                                                                              )
                                                                        : ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const unformattedValue =
                                                                        e.target.value.replace(
                                                                            /\./g,
                                                                            ""
                                                                        );
                                                                    setData(
                                                                        "start_meter",
                                                                        unformattedValue
                                                                    );
                                                                }}
                                                                errors={
                                                                    errors.start_meter
                                                                }
                                                            />
                                                        </div>
                                                        <div className="w-full mr-4 tablet:mt-8">
                                                            <Typography
                                                                variant="paragraph"
                                                                className="mb-2 text-base font-semibold "
                                                            >
                                                                Meteran Akhir
                                                            </Typography>
                                                            <CustomInput
                                                                label="Meteran Akhir"
                                                                id="end_meter"
                                                                value={
                                                                    data.end_meter
                                                                        ? data.end_meter
                                                                              .toString()
                                                                              .replace(
                                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                                  "."
                                                                              )
                                                                        : ""
                                                                }
                                                                onChange={(
                                                                    e
                                                                ) => {
                                                                    const unformattedValue =
                                                                        e.target.value.replace(
                                                                            /\./g,
                                                                            ""
                                                                        );
                                                                    setData(
                                                                        "end_meter",
                                                                        unformattedValue
                                                                    );
                                                                }}
                                                                errors={
                                                                    errors.end_meter
                                                                }
                                                            />
                                                        </div>
                                                        <div className="w-full mr-4 tablet:mt-8">
                                                            <Typography
                                                                variant="paragraph"
                                                                className="mb-2 text-base font-semibold "
                                                            >
                                                                Total Meteran
                                                            </Typography>
                                                            <CustomInput
                                                                disabled={true}
                                                                label="Total Meteran"
                                                                id="meter_reading"
                                                                value={
                                                                    data.meter_reading
                                                                        ? data.meter_reading
                                                                              .toString()
                                                                              .replace(
                                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                                  "."
                                                                              )
                                                                        : ""
                                                                }
                                                                errors={
                                                                    errors.meter_reading
                                                                }
                                                            />
                                                        </div>
                                                    </>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
                                            {billingType === "Air" ||
                                            billingType === "Listrik" ? (
                                                <>
                                                    <div className="w-full mr-4 tablet:mt-8">
                                                        <Typography
                                                            variant="paragraph"
                                                            className="mb-2 text-base font-semibold "
                                                        >
                                                            {isAirOrListrik()}
                                                        </Typography>
                                                        <CustomInput
                                                            label={isAirOrListrik()}
                                                            id="unit_price"
                                                            value={
                                                                data.unit_price
                                                                    ? data.unit_price
                                                                          .toString()
                                                                          .replace(
                                                                              /\B(?=(\d{3})+(?!\d))/g,
                                                                              "."
                                                                          )
                                                                    : ""
                                                            }
                                                            disabled={true}
                                                            errors={
                                                                errors.unit_price
                                                            }
                                                        />
                                                    </div>
                                                    <div className="w-full mr-4 tablet:mt-8">
                                                        <Typography
                                                            variant="paragraph"
                                                            className="mb-2 text-base font-semibold "
                                                        >
                                                            Minimum Charge
                                                        </Typography>
                                                        <CustomInput
                                                            label="Minimum Charge"
                                                            id="minimum_charge"
                                                            value={
                                                                data.minimum_charge
                                                                    ? data.minimum_charge
                                                                          .toString()
                                                                          .replace(
                                                                              /\B(?=(\d{3})+(?!\d))/g,
                                                                              "."
                                                                          )
                                                                    : 0
                                                            }
                                                            disabled={true}
                                                            errors={
                                                                errors.minimum_charge
                                                            }
                                                        ></CustomInput>
                                                    </div>
                                                </>
                                            ) : null}
                                        </div>
                                    </>

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
                                            <div className="w-full mt-8 mr-4 tablet:mt-0 tablet:mb-8">
                                                <Typography
                                                    variant="paragraph"
                                                    className="mb-2 text-base font-semibold "
                                                >
                                                    Tipe Unit
                                                </Typography>

                                                <Select
                                                    label="Tipe Unit"
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
                                                {errors.maintenance_type && (
                                                    <p className="mt-3 ml-0 text-sm text-red-500">
                                                        {
                                                            errors.maintenance_type
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {billingType === "Parkir" && (
                                            <div className="w-full mt-8 mr-4 tablet:mt-0 tablet:mb-8">
                                                <Typography
                                                    variant="paragraph"
                                                    className="mb-2 text-base font-semibold "
                                                >
                                                    Jenis Kendaraan
                                                </Typography>

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
                                                {errors.vehicle_type_parking && (
                                                    <p className="mt-3 ml-0 text-sm text-red-500">
                                                        {
                                                            errors.vehicle_type_parking
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        <div
                                            className={`${
                                                billingType === "Maintenance" ||
                                                billingType === "Parkir"
                                                    ? "mt-8 tablet:mt-0"
                                                    : "mt-0"
                                            } w-full mr-4`}
                                        >
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Nominal Tagihan
                                            </Typography>
                                            <CustomInput
                                                label="Nominal Tagihan"
                                                id="billing_fee"
                                                value={
                                                    data.billing_fee
                                                        ? data.billing_fee
                                                              .toString()
                                                              .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  "."
                                                              )
                                                        : ""
                                                }
                                                type="text"
                                                disabled={true}
                                                errors={errors.billing_fee}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Denda Tagihan Periode Sebelumnya
                                            </Typography>
                                            <CustomInput
                                                label="Denda Tagihan Periode Sebelumnya"
                                                id="fine"
                                                value={
                                                    data.fine
                                                        ? data.fine
                                                              .toString()
                                                              .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  "."
                                                              )
                                                        : 0
                                                }
                                                onChange={(e) => {
                                                    const unformattedValue =
                                                        e.target.value.replace(
                                                            /\./g,
                                                            ""
                                                        );
                                                    setData(
                                                        "fine",
                                                        unformattedValue
                                                    );
                                                }}
                                                disabled={
                                                    billingType !== "Parkir"
                                                }
                                                errors={errors.fine}
                                                className="tablet:mt-0"
                                            />
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Total Tagihan
                                            </Typography>
                                            <CustomInput
                                                label="Total Tagihan"
                                                id="total"
                                                disabled={true}
                                                value={
                                                    data.total_amount
                                                        ? data.total_amount
                                                              .toString()
                                                              .replace(
                                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                                  "."
                                                              )
                                                        : ""
                                                }
                                                errors={errors.total_amount}
                                                className="tablet:mt-0"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Tanggal Tagihan
                                            </Typography>
                                            <CustomInput
                                                id="billing_date"
                                                value={data.billing_date}
                                                onChange={(e) =>
                                                    handleChangeBillingDate(
                                                        e.target.value
                                                    )
                                                }
                                                errors={errors.billing_date}
                                                type="date"
                                            />
                                        </div>
                                        <div className="w-full mr-4 tablet:mt-8">
                                            <Typography
                                                variant="paragraph"
                                                className="mb-2 text-base font-semibold "
                                            >
                                                Tanggal Batas Pembayaran
                                            </Typography>
                                            <CustomInput
                                                label="Tanggal Batas Pembayaran"
                                                id="due_date"
                                                value={data.due_date}
                                                disabled={true}
                                                errors={errors.due_date}
                                                type="date"
                                            />
                                        </div>
                                    </div>
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
