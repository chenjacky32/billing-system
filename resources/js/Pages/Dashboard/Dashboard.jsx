import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link } from "@inertiajs/react";
import { Breadcrumbs } from "@material-tailwind/react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, Tooltip, Legend, ArcElement } from "chart.js";
import CustomTable from "@/Components/CustomTable";
import PieChart from "@/Components/PieContainer";
import PieContainer from "@/Components/PieContainer";
import BillingPieContainer from "@/Components/BillingPieContainer";

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

    const noData = billingChartData[0].count;
    const noData2 = billingChartData[1].count;
    const noData3 = billingChartData[2].count;

    const BillingChartData = {
        labels: ["Telah Lunas", "Belum Lunas", "Belum Lunas dan terkena Denda"],
        datasets: [
            {
                data: [
                    billingChartData[0].percentage,
                    billingChartData[1].percentage,
                    billingChartData[2].percentage,
                ],
                backgroundColor: ["#09E210", "#F9A405", "#FF6384"], // Adjust colors as needed
                hoverBackgroundColor: ["#09E210", "#F9A405", "#FF6384"], // Adjust hover colors as needed
            },
        ],
    };

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

    const role = auth.user.role;

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
                            Welcome to Dashboard, {auth.user.name}
                        </div>
                        <div className="flex flex-col flex-wrap p-5 ">
                            {role === "SUPER ADMIN" ? (
                                <div className="w-full  flex overflow-scroll shadow-[0_1px_100px_#c3b0f7] rounded-3xl">
                                    {data.map((apartmentData, index) => (
                                        <PieContainer
                                            key={index}
                                            name={apartmentData.apartmentName}
                                        >
                                            <Pie
                                                options={options}
                                                data={apartmentData.pieData}
                                            />
                                        </PieContainer>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full  flex items-center justify-center shadow-[0_1px_100px_#c3b0f7] rounded-3xl">
                                    <PieContainer name={data.apartmentName}>
                                        <Pie options={options} data={pieData} />
                                    </PieContainer>
                                </div>
                            )}

                            <div className="h-full laptop:h-full flex flex-col tablet:flex-col gap-8 laptop:gap-0 mt-8 rounded-3xl shadow-[0_1px_50px_#c3b0f7] p-6 overflow-x-auto overflow-y-auto">
                                <BillingPieContainer name="Grafik Tagihan IPL Bulan Ini">
                                    {noData !== 0 ||
                                    noData2 !== 0 ||
                                    noData3 !== 0 ? (
                                        <Pie
                                            options={options}
                                            data={BillingChartData}
                                        />
                                    ) : (
                                        <h1
                                            colSpan="3"
                                            className="py-2 pl-4 text-center"
                                        >
                                            No data available
                                        </h1>
                                    )}
                                </BillingPieContainer>
                                <div className="flex flex-row h-full gap-8 mt-8 laptop:h-full tablet:flex-col laptop:gap-0">
                                    <CustomTable
                                        data={paidData}
                                        title="Tagihan IPL yang Sudah Bayar"
                                        route={route("billing.paid.index")}
                                    />
                                    <CustomTable
                                        data={unpaidData}
                                        title="Tagihan IPL yang Belum Bayar"
                                        route={route("billing.unpaid.index")}
                                    />
                                    <CustomTable
                                        data={penaltyData}
                                        title="Tagihan IPL yang Terkena Denda"
                                        route={route("billing.penalties.index")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
