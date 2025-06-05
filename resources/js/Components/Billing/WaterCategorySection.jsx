import { Select, Option, Typography } from "@material-tailwind/react";

const WaterCategorySection = ({
    role,
    waterTypeSelected,
    billingType,
    waterOptions,
    handleChangeWater,
    errors,
}) => {
    if (role !== "SUPER ADMIN" || billingType !== "Air") return null;

    return (
        <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
            <div className="flex flex-col justify-start w-full tablet:flex-col tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    Kategori / Jenis Tagihan
                </Typography>
                <Select
                    label="Kategori / Jenis Tagihan"
                    id="water_type"
                    value={waterTypeSelected}
                    onChange={handleChangeWater}
                >
                    {waterOptions.map((items, index) => (
                        <Option key={index} value={items.value.toString()}>
                            {items.label}
                        </Option>
                    ))}
                </Select>
                {errors.water_type && (
                    <p className="mt-3 ml-0 text-sm text-red-500">
                        {errors.water_type}
                    </p>
                )}
            </div>
        </div>
    );
};

export default WaterCategorySection;
