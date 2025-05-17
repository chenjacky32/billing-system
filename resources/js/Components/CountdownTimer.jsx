import React from "react";
import { formatTime } from "@/utils/helper";

const CountdownTimer = ({ startDate, endDate }) => {
    const [timeLeft, setTimeLeft] = React.useState(null);
    const [status, setStatus] = React.useState("loading");

    React.useEffect(() => {
        const start = new Date(startDate).getTime();
        const end = new Date(endDate).getTime();

        if (isNaN(start) || isNaN(end)) {
            setStatus("invalid");
            return;
        }

        const checkTime = () => {
            const now = Date.now();
            if (now < start) {
                setStatus("not-started");
            } else if (now >= start && now <= end) {
                setStatus("running");
                setTimeLeft(end - now);
            } else {
                setStatus("expired");
            }
        };

        checkTime();
        const interval = setInterval(() => {
            checkTime();
        }, 1000);

        return () => clearInterval(interval);
    }, [startDate, endDate]);

    if (status === "invalid") return <span>Format tanggal tidak valid</span>;
    if (status === "not-started") return <span>Belum Mulai Berjalan</span>;
    if (status === "expired") return <span> VA Sudah Expired</span>;
    if (status === "loading") return <span>Memuat...</span>;

    return <span>{formatTime(timeLeft)}</span>;
};

export default CountdownTimer;
