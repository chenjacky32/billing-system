import React from "react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, Link, router, usePage, useForm } from "@inertiajs/react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
    Card,
    Typography,
    CardBody,
    IconButton,
    Tooltip,
    Breadcrumbs,
    Button,
} from "@material-tailwind/react";
import {
    FolderPlusIcon,
    TrashIcon,
    NoSymbolIcon,
} from "@heroicons/react/24/solid";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import PageHeader from "@/Components/PageHeader";
import CustomInput from "@/Components/CustomInput";
import InputLabel from "@/Components/InputLabel";
import MaintenancePage from "@/Components/MaintenancePage";

const TABLE_HEAD = [
    "No",
    "PartnerServiceId",
    "No Customer",
    "No Virtual Account",
    "Nama Virtual Account",
    "Jumlah Pembayaran",
    "Id-TRX",
    "Keterangan",
    "channel",
    "Sumber Akun VA",
    "Teller ID",
];

const VaReport = ({ auth, errors }) => {
    // const buttonIcon = <FolderPlusIcon strokeWidth={2} className="w-4 h-4" />;
    return <MaintenancePage namePages="VA Report" />;
    // return (
    //     <AuthenticatedLayout
    //         auth={auth}
    //         errors={errors}
    //         header={
    //             <h2 className="text-xl font-semibold leading-tight text-gray-800">
    //                 Get VA Report
    //             </h2>
    //         }
    //     >
    //         <Head title="Get VA Report" />

    //         <div className="py-12">
    //             <div className="w-full mx-auto max-w-1xl sm:px-6 lg:px-8">
    //                 <Breadcrumbs className="ml-[-0.9rem] w-96 bg-transparent">
    //                     <Link
    //                         href={route("dashboard")}
    //                         className="opacity-60 text-primaryHover"
    //                     >
    //                         Dashboard
    //                     </Link>
    //                     <Link
    //                         href={route("VAMonitoring.report")}
    //                         className="font-bold opacity-100 text-primary"
    //                     >
    //                         VA Report
    //                     </Link>
    //                     <a href="#"></a>
    //                 </Breadcrumbs>
    //                 <div className="bg-white overflow-hidden sm:rounded-lg shadow-[0_1px_100px_#c3b0f7] h-full">
    //                     <Card className="w-full h-full p-12">
    //                         <PageHeader
    //                             showAddButton={false}
    //                             title={"VA Report List"}
    //                             description={
    //                                 "Informasi Report Transaksi Virtual Account dari Sistem BRI"
    //                             }
    //                             icon={buttonIcon}
    //                             label="Cari Nomor VA"
    //                         />

    //                         <div className="mt-5">
    //                             <div className="flex flex-wrap w-full">
    //                                 {/* <div className="w-[21rem] mr-4 tablet:w-full"></div> */}
    //                                 <div className="mr-4 w-52 tablet:w-full tablet:mt-5">
    //                                     <InputLabel>Dari Tanggal</InputLabel>
    //                                     <CustomInput
    //                                         id="from_date"
    //                                         // onChange={(e) =>
    //                                         //     setFromDate(e.target.value)
    //                                         // } // Directly set the value
    //                                         className=""
    //                                         type="date"
    //                                     />
    //                                 </div>
    //                                 <div className="mr-4 w-52 tablet:w-full tablet:mt-5">
    //                                     <InputLabel>Sampai Tanggal</InputLabel>
    //                                     <CustomInput
    //                                         id="until_date"
    //                                         // onChange={(e) =>
    //                                         //     setUntilDate(e.target.value)
    //                                         // } // Directly set the value
    //                                         className=""
    //                                         type="date"
    //                                     />
    //                                 </div>
    //                             </div>
    //                             <div className="tablet:mr-4">
    //                                 <div className="mt-2 text-sm font-extrabold text-red-500 mobile:text-xs">
    //                                     **Harap isi semua filter di atas untuk
    //                                     melakukan filter data
    //                                 </div>
    //                                 <Button
    //                                     className="w-[49rem] mt-4 tablet:w-full tablet:mr-96 bg-white border-primary text-primary"
    //                                     variant="outlined"
    //                                     // onClick={applyFilters}
    //                                 >
    //                                     Cari
    //                                 </Button>
    //                             </div>
    //                         </div>

    //                         <CardBody className="px-0 overflow-scroll">
    //                             <table
    //                                 className="w-full mt-4 text-left border table-auto mobile:mt-0 min-w-max "
    //                                 style={{
    //                                     borderRadius: "10px",
    //                                     overflow: "hidden",
    //                                 }}
    //                             >
    //                                 <thead>
    //                                     <tr>
    //                                         {TABLE_HEAD.map((head, index) => (
    //                                             <th
    //                                                 key={index}
    //                                                 className="py-4 pl-4 border-y bg-primary"
    //                                             >
    //                                                 <Typography
    //                                                     variant="small"
    //                                                     className="font-bold text-textColor"
    //                                                 >
    //                                                     {head}
    //                                                 </Typography>
    //                                             </th>
    //                                         ))}
    //                                     </tr>
    //                                 </thead>
    //                                 <tbody></tbody>
    //                             </table>
    //                         </CardBody>
    //                     </Card>
    //                 </div>
    //             </div>
    //         </div>
    //         <ToastContainer />
    //     </AuthenticatedLayout>
    // );
};

export default VaReport;
