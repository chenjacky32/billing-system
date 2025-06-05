import InputUpload from "@/Components/InputUpload";

const ImageUploadSection = ({ billingType, setData, errors, data }) => {
    if (billingType !== "Air" && billingType !== "Listrik") return null;

    return (
        <div className="flex flex-row justify-start w-full mt-8 tablet:flex-col tablet:mt-0">
            <div className="w-full mr-4 tablet:mt-0">
                <InputUpload
                    label="Upload Foto Meteran Akhir"
                    className="tablet:mt-8"
                    onChange={(file) => setData("end_meter_image_path", file)}
                    error={errors.end_meter_image_path}
                    currentImage={data.end_meter_image_path}
                />
            </div>
        </div>
    );
};

export default ImageUploadSection;
