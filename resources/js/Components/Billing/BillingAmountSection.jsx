import { Typography } from "@material-tailwind/react";
import CustomInput from "@/Components/CustomInput";

const BillingAmountSection = ({ billingType, data, errors }) => {
    const formatNumber = (value) => {
        return value
            ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            : "";
    };

    return (
        <div
            className={`${
                billingType === "Maintenance" || billingType === "Parkir"
                    ? "mt-8 tablet:mt-0"
                    : "mt-0"
            } w-full mr-4`}
        >
            <Typography
                variant="paragraph"
                className="mb-2 text-base font-semibold"
            >
                Nominal Tagihan
            </Typography>
            <CustomInput
                label="Nominal Tagihan"
                id="billing_fee"
                value={data.billing_fee ? formatNumber(data.billing_fee) : ""}
                type="text"
                disabled={true}
                errors={errors.billing_fee}
            />
        </div>
    );
};

export default BillingAmountSection;
