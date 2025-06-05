import { Typography, Select, Option } from "@material-tailwind/react";

const VehicleTypeSection = ({
    billingType,
    vehicleTypeSelected,
    handleChangeVehicleType,
    vehicleOptions,
    errors,
}) => {
    if (billingType !== "Parkir") return null;

    return (
        <div className="w-full mt-8 mr-4 tablet:mt-0 tablet:mb-8">
            <Typography
                variant="paragraph"
                className="mb-2 text-base font-semibold"
            >
                Jenis Kendaraan
            </Typography>
            <Select
                label="Jenis Kendaraan"
                id="vehicle_type"
                value={vehicleTypeSelected}
                onChange={handleChangeVehicleType}
            >
                {vehicleOptions.map((items, index) => (
                    <Option key={index} value={items.value.toString()}>
                        {items.label}
                    </Option>
                ))}
            </Select>
            {errors.vehicle_type_parking && (
                <p className="mt-3 ml-0 text-sm text-red-500">
                    {errors.vehicle_type_parking}
                </p>
            )}
        </div>
    );
};

export default VehicleTypeSection;
