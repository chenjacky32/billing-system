import { Typography } from "@material-tailwind/react";
import CustomInput from "@/Components/CustomInput";

const TotalAmountSection = ({ data, setData, billingType, errors }) => {
    const formatNumber = (value) => {
        return value
            ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            : "";
    };

    const handleFineChange = (e) => {
        const unformattedValue = e.target.value.replace(/\./g, "");
        setData("fine", unformattedValue);
    };

    return (
        <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
            <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    Denda Tagihan Periode Sebelumnya
                </Typography>
                <CustomInput
                    label="Denda Tagihan Periode Sebelumnya"
                    id="fine"
                    value={data.fine ? formatNumber(data.fine) : 0}
                    onChange={handleFineChange}
                    disabled={billingType !== "Parkir"}
                    errors={errors.fine}
                    className="tablet:mt-0"
                />
            </div>

            <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    Total Tagihan
                </Typography>
                <CustomInput
                    label="Total Tagihan"
                    id="total"
                    disabled={true}
                    value={
                        data.total_amount ? formatNumber(data.total_amount) : 0
                    }
                    errors={errors.total_amount}
                    className="tablet:mt-0"
                />
            </div>
        </div>
    );
};

export default TotalAmountSection;
