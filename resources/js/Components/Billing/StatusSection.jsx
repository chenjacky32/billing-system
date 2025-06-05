import { Typography, Select, Option } from "@material-tailwind/react";
import CustomInput from "@/Components/CustomInput";

const StatusSection = ({
    data,
    setData,
    errors,
    status,
    handleStatusChange,
}) => {
    return (
        <div className="flex flex-row justify-start mt-8 tablet:flex-col tablet:mt-0">
            <div className="w-full mr-4 tablet:mt-8">
                <Typography
                    variant="paragraph"
                    className="mb-2 text-base font-semibold "
                >
                    Status Pembayaran
                </Typography>
                <Select
                    id="status"
                    color="blue"
                    value={status}
                    onChange={handleStatusChange}
                >
                    <Option value="Pending">Pending</Option>
                    <Option value="Success">Success</Option>
                    <Option value="Cancel">Cancel</Option>
                </Select>
                {errors.status && (
                    <p className="mt-3 ml-0 text-sm text-red-500">
                        {errors.status}
                    </p>
                )}
            </div>
            {status === "Success" && (
                <div className="flex flex-col w-full mr-4 tablet:mt-8">
                    <Typography
                        variant="paragraph"
                        className="mb-2 text-base font-semibold "
                    >
                        Tanggal Pembayaran
                    </Typography>
                    <CustomInput
                        id="paid_date"
                        value={data.paid_date}
                        onChange={(e) => setData("paid_date", e.target.value)}
                        errors={errors.paid_date}
                        className="tablet:mt-0"
                        type="date"
                    />
                </div>
            )}
        </div>
    );
};

export default StatusSection;
