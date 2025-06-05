import { Button } from "@material-tailwind/react";

const EditButton = ({ handleSubmit }) => {
    return (
        <div className="flex flex-row mt-8">
            <div className="flex gap-4 ml-0 w-max tablet:w-full tablet:mt-0">
                <Button
                    variant="filled"
                    onClick={handleSubmit}
                    className="bg-green-500 tablet:w-full"
                    loading={isLoading === "edit-billing"}
                >
                    Edit Data
                </Button>
            </div>
        </div>
    );
};

export default EditButton;
