import useDueDays from "@/Hooks/Billing/useDueDays";
import useFlashToast from "@/Hooks/Billing/useFlashToast";
import useWaterPricing from "@/Hooks/Billing/useWaterPricing";

const useBillingEffect = ({
    billingType,
    billingDueDays,
    setData,
    flash,
    WaterPriceData,
    WaterPriceMinimumCharge,
    waterPriceId,
}) => {
    useDueDays({ billingType, billingDueDays, setData });
    useFlashToast(flash);
    useWaterPricing({
        billingType,
        setData,
        WaterPriceData,
        WaterPriceMinimumCharge,
        waterPriceId,
    });
};

export default useBillingEffect;
