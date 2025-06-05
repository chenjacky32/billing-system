import { useEffect } from "react";

const useWaterPricing = ({
    billingType,
    setData,
    WaterPriceData,
    WaterPriceMinimumCharge,
    waterPriceId,
}) => {
    useEffect(() => {
        if (billingType === "Air" && WaterPriceData) {
            setData((prevValues) => ({
                ...prevValues,
                unit_price: WaterPriceData ?? 0,
                minimum_charge: WaterPriceMinimumCharge ?? 0,
                water_type: waterPriceId ?? 0,
            }));
        }
    }, [billingType, WaterPriceData, WaterPriceMinimumCharge]);
};

export default useWaterPricing;
