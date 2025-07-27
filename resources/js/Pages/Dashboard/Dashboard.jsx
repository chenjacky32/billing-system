import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router } from "@inertiajs/react";
import { Breadcrumbs, Button } from "@material-tailwind/react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";
import PieContainer from "@/Components/PieContainer";
import BillingPieContainer from "@/Components/BillingPieContainer";
import CustomDatePicker from "@/Components/CustomDatePicker";
import { TrashIcon } from "@heroicons/react/24/solid";
import dayjs from "dayjs";
import { useState } from "react";

ChartJS.register(Tooltip, Legend, ArcElement);

export default function Dashboard({
    auth,
    errors,
    data,
    paidData,
    unpaidData,
    penaltyData,
    billingChartData,
}) {
    const pieData = {
        labels: data.labels,
        datasets: [
            {
                data: [data.occupied, data.vacant],
                backgroundColor: ["#7e4efb", "#FF6384"],
                hoverBackgroundColor: ["#7e4efb", "#FF6384"],
            },
        ],
    };

    // const noData = billingChartData[0].count;
    // const noData2 = billingChartData[1].count;
    // const noData3 = billingChartData[2].count;

    // const BillingChartData = {
    //     labels: ["Telah Lunas", "Belum Lunas", "Belum Lunas dan terkena Denda"],
    //     datasets: [
    //         {
    //             data: [
    //                 billingChartData[0].percentage,
    //                 billingChartData[1].percentage,
    //                 billingChartData[2].percentage,
    //             ],
    //             backgroundColor: ["#09E210", "#F9A405", "#FF6384"], // Adjust colors as needed
    //             hoverBackgroundColor: ["#09E210", "#F9A405", "#FF6384"], // Adjust hover colors as needed
    //         },
    //     ],
    // };

    const options = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (tooltipItem) {
                        let label = tooltipItem.label || "";
                        if (label) {
                            label += ": ";
                        }
                        label += `${tooltipItem.raw.toFixed(2)}%`;
                        return label;
                    },
                },
            },
            title: {
                display: true,
                text: `Occupancy for ${data.apartmentName}`,
                font: {
                    size: 20,
                },
            },
        },
        maintainAspectRatio: false,
    };

    // Function to create chart data for each billing type
    const getBillingChartData = (type) => {
        const chartData = billingChartData[type];

        if (!chartData || !Array.isArray(chartData.data)) return null;
        const chartArray = chartData.data;

        return {
            labels: chartArray.map((item) => item.label),
            datasets: [
                {
                    data: chartArray.map((item) =>
                        Number(item.percentage.toFixed(2))
                    ),
                    backgroundColor: ["#09E210", "#F9A405", "#FF6384"], // Adjust colors as needed
                    hoverBackgroundColor: ["#09E210", "#F9A405", "#FF6384"],
                },
            ],
        };
    };
    const role = auth.user.role;

    const [period, setPeriod] = useState(null);

    function formattedDate(date) {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
    }

    const handleChangePeriod = (value) => {
        const firstDate = value.date(1);
        const resultFormatted = formattedDate(firstDate.$d);
        setPeriod(resultFormatted);

        router.get(
            route(route().current()),
            { period: resultFormatted },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const handleClearFilter = () => {
        setPeriod(null);
        router.get(
            route(route().current()),
            { period: null },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            errors={errors}
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="w-full h-full mx-auto max-w-1xl sm:px-6 lg:px-8">
                    <Breadcrumbs className="ml-[-0.9rem] w-96 bg-transparent">
                        <Link
                            href={route("dashboard")}
                            className="font-extrabold opacity-100 text-primaryHover "
                        >
                            Dashboard
                        </Link>

                        <a href="#"></a>
                    </Breadcrumbs>
                    <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
                        <div className="py-6 text-2xl font-extrabold text-center text-primary tablet:text-xl">
                            Selamat datang di Dashboard, {auth.user.name}
                        </div>
                        <div className="flex flex-col flex-wrap p-5 ">
                            {role === "SUPER ADMIN" ? (
                                <>
                                    <div className="w-full  flex overflow-scroll shadow-[0_1px_100px_#c3b0f7] rounded-3xl">
                                        {data.map((apartmentData, index) => (
                                            <PieContainer
                                                key={index}
                                                name={
                                                    apartmentData.apartmentName
                                                }
                                            >
                                                <Pie
                                                    options={options}
                                                    data={apartmentData.pieData}
                                                />
                                            </PieContainer>
                                        ))}
                                    </div>
                                    <div className="w-full mt-8  flex overflow-scroll shadow-[0_1px_100px_#c3b0f7] rounded-3xl">
                                        {data.map(
                                            (apartmentData, index) =>
                                                apartmentData.towerData &&
                                                apartmentData.towerData.length >
                                                    0 &&
                                                apartmentData.towerData.map(
                                                    (towerData, index) => (
                                                        <PieContainer
                                                            key={index}
                                                            name={
                                                                towerData.towerName
                                                            }
                                                        >
                                                            <Pie
                                                                options={
                                                                    options
                                                                }
                                                                data={
                                                                    towerData.pieData
                                                                }
                                                            />
                                                        </PieContainer>
                                                    )
                                                )
                                        )}
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="w-full  flex items-center justify-center shadow-[0_1px_100px_#c3b0f7] rounded-3xl">
                                        <PieContainer name={data.apartmentName}>
                                            <Pie
                                                options={options}
                                                data={pieData}
                                            />
                                        </PieContainer>
                                    </div>
                                    <div className="w-full mt-8 flex overflow-scroll shadow-[0_1px_100px_#c3b0f7] rounded-3xl">
                                        {data.towerData &&
                                            data.towerData.length > 0 &&
                                            data.towerData.map(
                                                (towerData, index) => (
                                                    <PieContainer
                                                        key={index}
                                                        name={
                                                            towerData.towerName
                                                        }
                                                    >
                                                        <Pie
                                                            options={options}
                                                            data={
                                                                towerData.pieData
                                                            }
                                                        />
                                                    </PieContainer>
                                                )
                                            )}
                                    </div>
                                </>
                            )}

                            <div className="h-full w-full overflow-scroll laptop:h-full flex flex-col tablet:flex-col gap-8 laptop:gap-0 mt-8 rounded-3xl shadow-[0_1px_50px_#c3b0f7] p-10 overflow-x-auto overflow-y-auto">
                                <div className="flex flex-row gap-0 mb-4">
                                    <h1 className="text-2xl font-extrabold text-left text-primary tablet:text-xl">
                                        Pilih Periode Bulan
                                    </h1>
                                </div>
                                <div className="flex flex-row gap-0 mobile:flex-col">
                                    <CustomDatePicker
                                        value={period ? dayjs(period) : null}
                                        onChange={handleChangePeriod}
                                        className="w-full mobile:w-full"
                                        placeholderText="Pilih Periode Bulan"
                                    />
                                    <div className="flex mobile:w-full mobile:mt-4">
                                        <Button
                                            className="flex items-center justify-center w-full gap-1 text-red-400 bg-white border-red-400 gap-2w-full tablet:w-full"
                                            variant="outlined"
                                            size="sm"
                                            onClick={handleClearFilter}
                                        >
                                            <TrashIcon className="w-4 h-4" />
                                            <span>Clear</span>
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {["AIR", "LISTRIK", "MAINTENANCE", "PARKIR"].map(
                                (billingType, index) => {
                                    const chartData =
                                        billingChartData[billingType];
                                    const hasData = chartData.total > 0;

                                    return (
                                        <div
                                            key={billingType}
                                            className="h-full laptop:h-full flex flex-col tablet:flex-col gap-8 laptop:gap-0 mt-8 rounded-3xl shadow-[0_1px_50px_#c3b0f7] p-10 overflow-x-auto overflow-y-auto"
                                        >
                                            <BillingPieContainer
                                                name={`Grafik Tagihan ${billingType} Periode Bulan ${
                                                    period
                                                        ? dayjs(period)
                                                              .locale("id")
                                                              .format(
                                                                  "MMMM YYYY"
                                                              )
                                                        : "Ini"
                                                }`}
                                            >
                                                {hasData ? (
                                                    <div className="h-full m-auto">
                                                        <Pie
                                                            options={{
                                                                ...options,
                                                                plugins: {
                                                                    ...options.plugins,
                                                                    title: {
                                                                        ...options
                                                                            .plugins
                                                                            .title,
                                                                        text: `Status Pembayaran ${billingType} Bulan Ini`,
                                                                    },
                                                                },
                                                            }}
                                                            data={getBillingChartData(
                                                                billingType
                                                            )}
                                                        />
                                                    </div>
                                                ) : (
                                                    <h1
                                                        colSpan="3"
                                                        className="py-2 pl-4 text-center"
                                                    >
                                                        Tidak ada data
                                                    </h1>
                                                )}
                                            </BillingPieContainer>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
