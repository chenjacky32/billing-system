import { Typography } from "@material-tailwind/react";
import CustomInput from "@/Components/CustomInput";
import { formatNumberWithDots } from "@/utils/helper";

const PriceSection = ({ billingType, data, errors }) => {
    if (billingType !== "Air" && billingType !== "Listrik") return null;

    const getPriceLabel = () => {
        if (billingType === "Air") return "Harga / m3";
        if (billingType === "Listrik") return "Harga / kWh";
        return "Harga / Unit";
    };

    return (
        <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
            <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    {getPriceLabel()}
                </Typography>
                <CustomInput
                    label={getPriceLabel()}
                    id="unit_price"
                    value={formatNumberWithDots(data.unit_price)}
                    disabled={true}
                    errors={errors.unit_price}
                />
            </div>

            <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    Minimum Charge
                </Typography>
                <CustomInput
                    label="Minimum Charge"
                    id="minimum_charge"
                    value={formatNumberWithDots(data.minimum_charge) || 0}
                    disabled={true}
                    errors={errors.minimum_charge}
                />
            </div>
        </div>
    );
};

export default PriceSection;
