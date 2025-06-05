import { useEffect } from "react";

const useDueDays = ({ billingType, billingDueDays, setData }) => {
    useEffect(() => {
        if (billingDueDays && billingType) {
            const rules = billingDueDays[0]?.billingTypeRules?.find(
                (items) => items.billingType === billingType
            );

            if (rules?.due_days !== undefined) {
                setData((prev) => ({
                    ...prev,
                    due_days: rules.due_days ?? 10,
                }));
            }
        }
    }, [billingType, billingDueDays]);
};

export default useDueDays;
