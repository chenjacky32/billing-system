import React from "react";
import InputSelect from "@/Components/InputSelect";
import CustomInput from "@/Components/CustomInput";
import { Select, Option, Typography } from "@material-tailwind/react";
import { formatNumberWithDots } from "@/utils/helper";

const RoomNumberSection = ({
    room,
    handleRoomChange,
    roomOptions,
    errors,
    tower,
    residence,
    unitPowerlabel,
    unitPowerValue,
    billingType,
    // handleBillingTypeChange,
}) => {
    return (
        <div className="flex flex-row justify-start mt-8 tablet:flex-col ">
            <div className="flex flex-col w-full mr-4">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold "
                >
                    Nomor Unit
                </Typography>

                <InputSelect
                    value={room}
                    onChange={handleRoomChange}
                    options={roomOptions}
                    disabled={!tower.value || tower.value === "" ? true : false}
                />
                {errors.room_no && (
                    <p className="mt-3 ml-0 text-sm text-red-500">
                        {errors.room_no}
                    </p>
                )}
            </div>
            {billingType === "Listrik" ? (
                <div className="w-full mr-4 tablet:mt-8">
                    <Typography
                        variant="paragraph"
                        className="mb-2 text-base font-semibold"
                    >
                        {unitPowerlabel}
                    </Typography>
                    <CustomInput
                        value={formatNumberWithDots(unitPowerValue)}
                        disabled={true}
                    />
                </div>
            ) : null}

            <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold"
                >
                    Nama Owner
                </Typography>
                <CustomInput value={residence?.name ?? ""} disabled={true} />
            </div>
            {/* <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold "
                >
                    Tipe Billing
                </Typography>
                <Select
                    id="billing_type"
                    color="blue"
                    value={billingType}
                    onChange={handleBillingTypeChange}
                >
                    {TypeBilling.map((item, index) => (
                        <Option key={index} value={item}>
                            {item}
                        </Option>
                    ))}
                </Select>
            </div> */}
        </div>
    );
};

export default RoomNumberSection;
