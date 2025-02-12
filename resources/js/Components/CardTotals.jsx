import React from "react";
import {
    BanknotesIcon,
    WalletIcon,
    ScaleIcon,
} from "@heroicons/react/24/solid";
import { Card, CardBody, Typography } from "@material-tailwind/react";

const CardTotals = ({ value, label, variant = "blue" }) => {
    const variantStyle = {
        blue: {
            border: "border-blue-200",
            background: "bg-blue-50",
            iconBackground: "bg-blue-100",
            iconColor: "text-blue-700",
            textColor: "text-purple-600",
            icon: BanknotesIcon,
        },
        yellow: {
            border: "border-orange-200",
            background: "bg-orange-50",
            iconBackground: "bg-orange-100",
            iconColor: "text-orange-700",
            textColor: "text-orange-600",
            icon: WalletIcon,
        },
        red: {
            border: "border-red-200",
            background: "bg-red-50",
            iconBackground: "bg-red-100",
            iconColor: "text-red-700",
            textColor: "text-red-600",
            icon: ScaleIcon,
        },
    };

    const styles = variantStyle[variant] || variantStyle.blue;
    return (
        <Card
            className={`w-full border rounded-lg min-w-md 
                        ${styles.border} 
                        ${styles.background}`}
        >
            <CardBody className="flex flex-row items-start w-full gap-4 p-6 tablet:p-4">
                <span
                    className={`p-4 ${styles.iconBackground} rounded-xl mobile:p-3`}
                >
                    {React.createElement(styles.icon, {
                        className: `w-6 h-6 ${styles.iconColor}`,
                    })}
                </span>
                <div>
                    <Typography
                        className={`text-xl font-bold ${styles.textColor}`}
                    >
                        {value}
                    </Typography>
                    <Typography className="font-normal">{label}</Typography>
                </div>
            </CardBody>
        </Card>
    );
};

export default CardTotals;
