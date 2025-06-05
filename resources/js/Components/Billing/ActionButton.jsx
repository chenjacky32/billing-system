import { Button } from "@material-tailwind/react";
import { TrashIcon } from "@heroicons/react/24/solid";

const ActionButton = ({
    handleCountBilling,
    handleClearCountBilling,
    handleSubmit,
    isLoading,
    isEditPage = false,
}) => {
    return (
        <div className="flex flex-row justify-start w-full gap-2 mt-8 tablet:flex-col tablet:mt-0">
            <div className="mr-4 w-fit tablet:mt-8 tablet:w-full">
                <Button
                    variant="filled"
                    onClick={handleCountBilling}
                    className="bg-orange-500 tablet:w-full"
                    loading={isLoading === "count-billing"}
                >
                    Hitung Tagihan
                </Button>
            </div>

            <div className="mr-4 w-fit tablet:mt-8 tablet:w-full">
                <Button
                    variant="filled"
                    onClick={handleClearCountBilling}
                    className="flex items-center justify-center gap-2 bg-red-500 tablet:w-full"
                >
                    <TrashIcon className="w-4 h-4" />
                    <span>Clear</span>
                </Button>
            </div>

            {isEditPage === false ? (
                <div className="mr-4 w-fit tablet:mt-8 tablet:w-full">
                    <Button
                        variant="filled"
                        onClick={handleSubmit}
                        className="bg-green-500 tablet:w-full"
                        loading={isLoading === "add-billing"}
                    >
                        Tambah Data
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export default ActionButton;
