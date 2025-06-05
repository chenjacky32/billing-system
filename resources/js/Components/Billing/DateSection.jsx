import { Typography } from "@material-tailwind/react";
import CustomInput from "@/Components/CustomInput";

const DateSection = ({ data, handleChangeBillingDate, errors }) => (
    <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
        <div className="w-full mr-4 tablet:mt-8">
            <Typography
                variant="paragraph"
                className="mb-2 text-base font-semibold"
            >
                Tanggal Tagihan
            </Typography>
            <CustomInput
                id="billing_date"
                value={data.billing_date}
                onChange={(e) => handleChangeBillingDate(e.target.value)}
                errors={errors.billing_date}
                type="date"
            />
        </div>

        <div className="w-full mr-4 tablet:mt-8">
            <Typography
                variant="paragraph"
                className="mb-2 text-base font-semibold"
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
);

export default DateSection;
