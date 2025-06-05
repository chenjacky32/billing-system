import { useState } from "react";

const useBillingState = (
    towerData,
    WaterPriceData,
    WaterPriceMinimumCharge,
    waterPriceId,
    defaultState = {}
) => {
    const [room, setRoom] = useState(defaultState.room || null);
    const [roomOptions, setRoomOptions] = useState(
        defaultState.roomOptions || []
    );
    const [tower, setTower] = useState(defaultState.tower || towerData[0]);
    const [billingType, setBillingType] = useState(
        defaultState.billingType || "Air"
    );
    const [waterTypeSelected, setWaterTypeSelected] = useState(
        defaultState.waterTypeSelected || ""
    );
    const [electricTypeSelected, setElectricTypeSelected] = useState(
        defaultState.electricTypeSelected || ""
    );
    const [maintenanceTypeSelected, setMaintenanceTypeSelected] = useState(
        defaultState.maintenanceTypeSelected || ""
    );
    const [vehicleTypeSelected, setVehicleTypeSelected] = useState(
        defaultState.vehicleTypeSelected || ""
    );
    const [isLoading, setIsLoading] = useState(null);
    const [residence, setResidence] = useState(
        defaultState.residence || {
            name: "",
            apartTypeName: "",
            apartTypeId: "",
        }
    );

    return {
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
    };
};

export default useBillingState;
