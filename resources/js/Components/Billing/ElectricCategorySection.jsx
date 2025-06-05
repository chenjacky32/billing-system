import { Typography, Select, Option } from "@material-tailwind/react";

const ElectricCategorySection = ({
    billingType,
    electricTypeSelected,
    handleElectricChange,
    electricOptions,
    errors,
}) => {
    if (billingType !== "Listrik") return null;

    return (
        <div className="w-full mr-4">
            <Typography
                variant="paragraph"
                className="mb-2 text-base font-semibold"
            >
                Kategori / Jenis Tagihan
            </Typography>
            <Select
                label="Kategori / Jenis Tagihan"
                value={electricTypeSelected}
                disabled={true}
                id="electric_type"
                onChange={handleElectricChange}
            >
                {electricOptions.map((items, index) => {
                    return (
                        <Option key={index} value={items.value.toString()}>
                            {items.label}
                        </Option>
                    );
                })}
            </Select>
            {errors.electric_type && (
                <p className="mt-3 ml-0 text-sm text-red-500">
                    {errors.electric_type}
                </p>
            )}
        </div>
    );
};

export default ElectricCategorySection;
