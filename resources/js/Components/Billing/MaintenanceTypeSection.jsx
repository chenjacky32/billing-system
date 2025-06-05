import { Typography, Select, Option } from "@material-tailwind/react";

const MaintenanceTypeSection = ({
    billingType,
    maintenanceTypeSelected,
    handleChangeMaintenanceType,
    maintenanceOptions,
    errors,
}) => {
    if (billingType !== "Maintenance") return null;

    return (
        <div className="w-full mt-8 mr-4 tablet:mt-0 tablet:mb-8">
            <Typography
                variant="paragraph"
                className="mb-2 text-base font-semibold"
            >
                Tipe Unit
            </Typography>
            <Select
                label="Tipe Unit"
                id="maintenance_type"
                value={maintenanceTypeSelected}
                onChange={handleChangeMaintenanceType}
                disabled
                errors={errors.maintenance_type}
            >
                {maintenanceOptions.map((items, index) => {
                    return (
                        <Option key={index} value={items.value.toString()}>
                            {items.label}
                        </Option>
                    );
                })}
            </Select>
            {errors.maintenance_type && (
                <p className="mt-3 ml-0 text-sm text-red-500">
                    {errors.maintenance_type}
                </p>
            )}
        </div>
    );
};

export default MaintenanceTypeSection;
