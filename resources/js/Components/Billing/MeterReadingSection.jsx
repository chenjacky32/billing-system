import { Button, Typography } from "@material-tailwind/react";
import CustomInput from "@/Components/CustomInput";
const MeterReadingSection = ({
    billingType,
    data,
    setData,
    errors,
    handleGetPreviousMeter,
    isLoading,
}) => {
    if (billingType !== "Listrik" && billingType !== "Air") return null;

    const formatNumber = (value) => {
        return value
            ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
            : "";
    };

    const handleNumberInput = (field, value) => {
        const unformattedValue = value.replace(/\./g, "");
        setData(field, unformattedValue);
    };

    return (
        <>
            <div
                className={`w-full mr-4 ${
                    billingType === "Air" ? "tablet:mt-0" : "tablet:mt-8"
                }`}
            >
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    Meteran Awal
                </Typography>
                <CustomInput
                    label="Meteran Awal"
                    id="start_meter"
                    value={
                        data.start_meter ? formatNumber(data.start_meter) : ""
                    }
                    onChange={(e) =>
                        handleNumberInput("start_meter", e.target.value)
                    }
                    errors={errors.start_meter}
                />
            </div>

            <div className="w-full mr-4 tablet:mt-8">
                <div className="mt-8 tablet:mt-0">
                    <Button
                        variant="filled"
                        size="md"
                        onClick={handleGetPreviousMeter}
                        className="bg-blue-500 w-fit tablet:w-full"
                        loading={isLoading === "get-previous-meter"}
                    >
                        Ambil Meteran Awal
                    </Button>
                </div>
            </div>

            <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    Meteran Akhir
                </Typography>
                <CustomInput
                    label="Meteran Akhir"
                    id="end_meter"
                    value={data.end_meter ? formatNumber(data.end_meter) : ""}
                    onChange={(e) =>
                        handleNumberInput("end_meter", e.target.value)
                    }
                    errors={errors.end_meter}
                />
            </div>

            <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    Total Meteran
                </Typography>
                <CustomInput
                    disabled={true}
                    label="Total Meteran"
                    id="meter_reading"
                    value={formatNumber(data.meter_reading)}
                    errors={errors.meter_reading}
                />
            </div>
        </>
    );
};

export default MeterReadingSection;
