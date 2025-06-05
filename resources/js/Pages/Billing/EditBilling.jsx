import PageHeader from "@/Components/PageHeader";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Breadcrumbs, Button, Card, CardBody } from "@material-tailwind/react";
import { useState } from "react";
import { getOptionsForType, formattedDate } from "@/utils/helper";
import dayjs from "dayjs";
import useBillingForm from "@/Hooks/Billing/useBillingForm";
import useBillingState from "@/Hooks/Billing/useBillingState";
import PeriodSection from "@/Components/Billing/PeriodSection";
import BillingTypeSection from "@/Components/Billing/BillingTypeSection";
import TowerSection from "@/Components/Billing/TowerSection";
import RoomNumberSection from "@/Components/Billing/RoomNumberSection";
import WaterCategorySection from "@/Components/Billing/WaterCategorySection";
import ElectricCategorySection from "@/Components/Billing/ElectricCategorySection";
import MeterReadingSection from "@/Components/Billing/MeterReadingSection";
import PriceSection from "@/Components/Billing/PriceSection";
import ImageUploadSection from "@/Components/Billing/ImageUploadSection";
import MaintenanceTypeSection from "@/Components/Billing/MaintenanceTypeSection";
import VehicleTypeSection from "@/Components/Billing/VehicleTypeSection";
import BillingAmountSection from "@/Components/Billing/BillingAmountSection";
import TotalAmountSection from "@/Components/Billing/TotalAmountSection";
import DateSection from "@/Components/Billing/DateSection";
import ActionButton from "@/Components/Billing/ActionButton";
import StatusSection from "@/Components/Billing/StatusSection";
import useBillingEffect from "@/Hooks/Billing/useBillingEffect";
import { ApiService } from "@/service/ApiService";
import { NetworkEndpoint } from "@/service/ApiEndpoint";

export default function Edit({
    auth,
    ownerData,
    billingData,
    billingCategory,
    roomNumber,
    towerData,
    WaterPriceData,
    WaterPriceMinimumCharge,
    waterPriceId,
    apartmentId,
    billingDueDays,
}) {
    const mappedRoomNumber = roomNumber.map((number) => ({
        ...number,
        label: `No - ${number.label}`,
    }));

    const findTower = towerData.find(
        (item) => item.value === billingData?.tower_id
    );

    const initialRoomOptions = findTower
        ? mappedRoomNumber.filter(
              (room) => room.apartmentTowerId === findTower.value
          )
        : [];

    const findRoomNumber = mappedRoomNumber.find(
        (item) => item.value == billingData?.residence_id
    );

    const foundItem = roomNumber.find(
        (items) => items.value === billingData.residence_id
    );

    const {
        room,
        setRoom,
        roomOptions,
        setRoomOptions,
        tower,
        setTower,
        billingType,
        setBillingType,
        waterTypeSelected,
        setWaterTypeSelected,
        electricTypeSelected,
        setElectricTypeSelected,
        maintenanceTypeSelected,
        setMaintenanceTypeSelected,
        vehicleTypeSelected,
        setVehicleTypeSelected,
        isLoading,
        setIsLoading,
        residence,
        setResidence,
    } = useBillingState(
        towerData,
        WaterPriceData,
        WaterPriceMinimumCharge,
        waterPriceId,
        {
            room: findRoomNumber || null,
            roomOptions: initialRoomOptions,
            tower: findTower || { value: "" },
            billingType: billingData.billing_type,
            waterTypeSelected:
                billingData.billing_category_id?.toString() || "",
            electricTypeSelected:
                billingData.billing_category_id?.toString() || "",
            maintenanceTypeSelected:
                billingData.billing_category_id?.toString() || "",
            vehicleTypeSelected:
                billingData.billing_category_id?.toString() || "",
            residence: {
                name: foundItem.ownerName ?? "",
                apartTypeName: foundItem.apartType?.name ?? "",
                apartTypeId:
                    foundItem.apartType?.id ?? foundItem.apartmentTypeId,
            },
        }
    );

    const {
        data,
        setData,
        post,
        processing,
        errors,
        setError,
        clearErrors,
        flash,
    } = useBillingForm(
        {
            maintenanceTypeSelected: maintenanceTypeSelected,
            vehicleTypeSelected: vehicleTypeSelected,
            waterTypeSelected: waterTypeSelected,
            electricTypeSelected: electricTypeSelected,
            roomNo: room,
        },
        apartmentId,
        true,
        billingData
    );

    const [status, setStatus] = useState(billingData.status);
    const role = auth.user.role;

    // LOGGING INPUT REQUEST
    console.log("SUB PERIODE", data.period);
    console.log("NAMA TOWER", data.tower_id);
    console.log("State Tower", tower);
    console.log("TIPE BILLING", billingType);
    console.log("State Billing", data.billing_type);
    console.log("METERAN AWAL", data.start_meter);
    console.log("METERAN AKHIR", data.end_meter);
    console.log("TOTAL METERAN", data.meter_reading);
    console.log("HARGA", data.unit_price);
    console.log("MINIMUM CHARGE", data.minimum_charge);
    console.log("UPLOAD FOTO", data.end_meter_image_path);
    console.log("DENDA PERIODE SEBELUMNYA", data.fine);
    console.log("TOTAL TAGIHAN", data.total_amount);
    console.log("TANGGAL TAGIHAN", data.billing_date);
    console.log("TANGGAL JATUH TEMPO", data.due_date);
    console.log("TANGGAL PEMBAYARAN", data.paid_date);
    console.log("LAMA JATUH TEMPO", data.due_days);
    console.log("STATUS", data.status);

    const maintenanceOptions = getOptionsForType(
        "Maintenance",
        billingCategory
    );
    const vehicleOptions = getOptionsForType("Parkir", billingCategory);
    const electricOptions = getOptionsForType("Listrik", billingCategory);
    const waterOptions = getOptionsForType("Air", billingCategory);

    useBillingEffect({
        billingType,
        billingDueDays,
        setData,
        flash,
        WaterPriceData,
        WaterPriceMinimumCharge,
        waterPriceId,
    });

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

    const handleRoomChange = (value) => {
        setRoom(value);
        setResidence((prevState) => ({
            ...prevState,
            name: value.ownerName,
            apartTypeName: value.apartType?.name ?? "",
        }));
        setData((prevValue) => ({
            ...prevValue,
            room_no: value.value,
            owner_id: value.value,
            // tower_id: value.apartmentTowerId,
        }));
        if (billingType === "Maintenance") {
            const matchedMaintenanceOption = maintenanceOptions.find(
                (item) => item.label === value.apartType?.name
            );

            if (matchedMaintenanceOption) {
                setMaintenanceTypeSelected(
                    matchedMaintenanceOption.value.toString()
                );

                setData((prevValue) => ({
                    ...prevValue,
                    maintenance_type: matchedMaintenanceOption.value.toString(),
                }));
            }
        } else if (billingType === "Listrik") {
            const matchedElectricOption = electricOptions.find(
                (item) => item.label === value.apartType?.name
            );

            if (matchedElectricOption) {
                setElectricTypeSelected(matchedElectricOption.value.toString());

                setData((prevValue) => ({
                    ...prevValue,
                    electric_type: matchedElectricOption.value.toString(),
                    unit_price: matchedElectricOption?.price,
                    minimum_charge: matchedElectricOption?.minimum_charge,
                }));
            }
        } else {
            setMaintenanceTypeSelected("");
            setData((prevValue) => ({
                ...prevValue,
                maintenance_type: "",
            }));
        }
    };

    const handleTowerChange = (value) => {
        setTower(value);
        const filteredRooms = mappedRoomNumber.filter((room) => {
            return room.apartmentTowerId === value.value;
        });

        setRoomOptions(filteredRooms);
        setRoom({ value: "", label: "" });
        setData((prevValue) => ({
            ...prevValue,
            tower_id: value.value,
            room_no: "",
        }));
    };

    const handleBillingTypeChange = (value) => {
        setBillingType(value);
        setResidence((prevState) => ({
            ...prevState,
            name: "",
            apartTypeName: "",
            apartTypeId: "",
        }));
        setRoom(null);
        setWaterTypeSelected(waterPriceId);
        if (value === "Air" && WaterPriceData) {
            setData((prevValues) => ({
                ...prevValues,
                billing_type: value,
                unit_price: WaterPriceData,
                minimum_charge: WaterPriceMinimumCharge,
                water_type: waterPriceId,
            }));
        } else {
            setWaterTypeSelected("");
            setElectricTypeSelected("");
            setMaintenanceTypeSelected("");
            setVehicleTypeSelected("");
            setData((prevValues) => ({
                ...prevValues,
                billing_type: value,
                meter_reading: null,
                billing_fee: null,
                water_type: null,
                electric_type: null,
                maintenance_type: null,
                vehicle_type_parking: null,
                minimum_charge: 0,
                unit_price: "",
            }));
        }
    };

    const dataID = billingData.id;

    // ! Handle submit
    function handleSubmit(e) {
        e.preventDefault();
        setIsLoading("edit-billing");
        post(`/billing/${dataID}/update`, {
            onFinish: () => setIsLoading(null),
        });
    }

    async function handleGetPreviousMeter(e) {
        e.preventDefault();
        [
            "billing_type",
            "period",
            "owner_id",
            "room_no",
            "tower_id",
            "water_type",
            "electric_type",
        ].forEach((field) => setError(field, ""));
        setData((prevValues) => ({
            ...prevValues,
            start_meter: "",
        }));

        setIsLoading("get-previous-meter");
        try {
            const response = await ApiService.post(
                "",
                route(NetworkEndpoint.BILLING_PREVIOUS_METER),
                {
                    billing_type: billingType,
                    period: data.period,
                    owner_id: data.owner_id,
                    room_no: data.room_no,
                    tower_id: data.tower_id,
                    water_type: data.water_type,
                    electric_type: data.electric_type,
                }
            );

            setData((prevValues) => ({
                ...prevValues,
                start_meter: response.new_start_meter,
            }));
            toast.success(response.message);
        } catch (error) {
            if (error.response.status == 404) {
                toast.error(
                    error.response.data.message ||
                        "Meteran periode sebelumnya tidak ditemukan. Silahkan Input Meteran Awal."
                );
            } else if (error.response.status == 422) {
                if (error.response.data?.errors) {
                    Object.entries(error.response.data.errors).forEach(
                        ([field, messages]) => {
                            setError(field, messages[0]);
                        }
                    );
                }
                toast.error(error.response.data.message);
            } else {
                toast.error("Ada kesalahan, silahkan coba lagi.");
            }
        } finally {
            setIsLoading(null);
        }
    }

    // ! Handle Count Billing
    async function handleCountBilling(e) {
        e.preventDefault();
        clearErrors();
        setIsLoading("count-billing");
        try {
            const response = await ApiService.post(
                "",
                route(NetworkEndpoint.BILLING_COUNT_FEE_AND_FINE),
                data
            );

            if (response.statusCode == 200) {
                setData((prevValues) => ({
                    ...prevValues,
                    billing_fee: response.billing_fee,
                    meter_reading: response.meter_reading,
                    fine: response.fine,
                    total_amount: response.total_amount,
                }));
                toast.success(response.message);
            }
        } catch (error) {
            if (error.response.status == 404) {
                toast.error(error.response.data.message);
            } else if (error.response.status == 422) {
                if (error.response.data?.errors) {
                    Object.entries(error.response.data.errors).forEach(
                        ([field, messages]) => {
                            setError(field, messages[0]);
                        }
                    );
                }
                toast.error(error.response.data.message);
            } else {
                toast.error("Ada kesalahan, silahkan coba lagi.");
            }
        } finally {
            setIsLoading(null);
        }
    }

    // ! Handle Clear Count Billing
    function handleClearCountBilling() {
        if (billingType === "Listrik" || billingType === "Air") {
            setRoom({ value: "", label: "" });
            setTower({ value: "" });
            setResidence((prevState) => ({
                ...prevState,
                name: "",
                apartTypeName: "",
                apartTypeId: "",
            }));
            setStatus("Pending");
            setData((prevValues) => ({
                ...prevValues,
                period: "",
                billing_date: "",
                due_date: "",
                start_meter: "",
                tower_id: "",
                room_no: "",
                owner_id: "",
                end_meter: "",
                meter_reading: "",
                end_meter_image_path: null,
                billing_fee: "",
                total_amount: "",
                paid_date: "",
                fine: "",
                status: "Pending",
            }));
        } else if (billingType === "Maintenance" || billingType === "Parkir") {
            setData((prevValues) => ({
                ...prevValues,
                meter_reading: null,
                billing_fee: "",
                total_amount: "",
                fine: "",
                maintenance_type: "",
                vehicle_type_parking: "",
                period: "",
                billing_date: "",
                due_date: "",
                tower_id: "",
                end_meter_image_path: null,
                room_no: "",
                owner_id: "",
                paid_date: "",
                status: "Pending",
            }));
            setMaintenanceTypeSelected("");
            setVehicleTypeSelected("");
            setRoom({ value: "", label: "" });
            setTower({ value: "" });
            setResidence((prevState) => ({
                ...prevState,
                name: "",
                apartTypeName: "",
                apartTypeId: "",
            }));
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
                                    <PeriodSection
                                        title="Sub Periode Tagihan"
                                        data={data}
                                        handleChangePeriod={handleChangePeriod}
                                        errors={errors}
                                    />
                                    <BillingTypeSection
                                        billingType={billingType}
                                        handleBillingTypeChange={
                                            handleBillingTypeChange
                                        }
                                    />
                                    <TowerSection
                                        title="Nama Tower"
                                        data={data}
                                        residence={residence}
                                        handleTowerChange={handleTowerChange}
                                        tower={tower}
                                        billingType={billingType}
                                        towerData={towerData}
                                        errors={errors}
                                    />
                                    <RoomNumberSection
                                        room={room}
                                        handleRoomChange={handleRoomChange}
                                        roomOptions={roomOptions}
                                        errors={errors}
                                        tower={tower}
                                        residence={residence}
                                    />
                                    <WaterCategorySection
                                        role={role}
                                        value={waterTypeSelected}
                                        billingType={billingType}
                                        waterOptions={waterOptions}
                                        handleChangeWater={handleChangeWater}
                                        errors={errors}
                                    />

                                    <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
                                        <div className="flex flex-row justify-start w-full tablet:flex-col tablet:mt-8">
                                            <ElectricCategorySection
                                                billingType={billingType}
                                                electricTypeSelected={
                                                    electricTypeSelected
                                                }
                                                handleElectricChange={
                                                    handleElectricChange
                                                }
                                                electricOptions={
                                                    electricOptions
                                                }
                                                errors={errors}
                                            />
                                            <MeterReadingSection
                                                billingType={billingType}
                                                data={data}
                                                setData={setData}
                                                errors={errors}
                                                handleGetPreviousMeter={
                                                    handleGetPreviousMeter
                                                }
                                                isLoading={isLoading}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <PriceSection
                                            billingType={billingType}
                                            data={data}
                                            errors={errors}
                                        />
                                        <ImageUploadSection
                                            billingType={billingType}
                                            setData={setData}
                                            errors={errors}
                                            data={data}
                                        />
                                    </div>
                                    <div
                                        className={`flex flex-row justify-start tablet:flex-col 
                                            ${
                                                billingType === "Listrik" ||
                                                billingType === "Air"
                                                    ? "mt-8"
                                                    : "mt-0 tablet:mt-8"
                                            } `}
                                    >
                                        <MaintenanceTypeSection
                                            billingType={billingType}
                                            maintenanceTypeSelected={
                                                maintenanceTypeSelected
                                            }
                                            handleChangeMaintenanceType={
                                                handleChangeMaintenanceType
                                            }
                                            maintenanceOptions={
                                                maintenanceOptions
                                            }
                                            errors={errors}
                                        />
                                        <VehicleTypeSection
                                            billingType={billingType}
                                            vehicleTypeSelected={
                                                vehicleTypeSelected
                                            }
                                            handleChangeVehicleType={
                                                handleChangeVehicleType
                                            }
                                            vehicleOptions={vehicleOptions}
                                            errors={errors}
                                        />
                                        <BillingAmountSection
                                            billingType={billingType}
                                            data={data}
                                            errors={errors}
                                        />
                                    </div>
                                    <TotalAmountSection
                                        data={data}
                                        setData={setData}
                                        billingType={billingType}
                                        errors={errors}
                                    />
                                    <DateSection
                                        data={data}
                                        handleChangeBillingDate={
                                            handleChangeBillingDate
                                        }
                                        errors={errors}
                                    />
                                    <ActionButton
                                        handleCountBilling={handleCountBilling}
                                        handleClearCountBilling={
                                            handleClearCountBilling
                                        }
                                        isLoading={isLoading}
                                        isEditPage={true}
                                    />
                                    <StatusSection
                                        data={data}
                                        setData={setData}
                                        errors={errors}
                                        status={status}
                                        handleStatusChange={handleStatusChange}
                                    />
                                    <div className="flex flex-row mt-8">
                                        <div className="flex gap-4 ml-0 w-max tablet:w-full tablet:mt-0">
                                            <Button
                                                variant="filled"
                                                onClick={handleSubmit}
                                                className="bg-green-500 tablet:w-full"
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
            <ToastContainer />
        </AuthenticatedLayout>
    );
}
