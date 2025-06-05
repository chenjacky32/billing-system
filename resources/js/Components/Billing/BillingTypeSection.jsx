import React from "react";
import { Select, Option, Typography } from "@material-tailwind/react";
import { TypeBilling } from "@/utils/constant";

const BillingTypeSection = ({ billingType, handleBillingTypeChange }) => {
    return (
        <div className="flex flex-row justify-start mt-8 tablet:flex-col">
            <div className="flex flex-col w-full mr-4">
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
            </div>
        </div>
    );
};

export default BillingTypeSection;
