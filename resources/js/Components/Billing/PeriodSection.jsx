import dayjs from "dayjs";
import { Typography } from "@material-tailwind/react";
import CustomDatePicker from "@/Components/CustomDatePicker";

const PeriodSection = ({
    title = "Sub Periode Tagihan",
    data,
    handleChangePeriod,
    errors,
}) => (
    <div className="flex flex-row justify-start tablet:flex-col">
        <div className="w-full mr-4 tablet:mt-8">
            <Typography
                variant="paragraph"
                className="mb-2 text-base font-semibold"
            >
                {title}
            </Typography>
            <CustomDatePicker
                value={data.period ? dayjs(data.period) : null}
                placeholderText="Pilih Periode Bulan"
                onChange={handleChangePeriod}
            />
            {errors.period && (
                <p className="mt-3 ml-0 text-sm text-red-500">
                    {errors.period}
                </p>
            )}
        </div>
    </div>
);

export default PeriodSection;
