import CryptoJS from "crypto-js";
import { loadImageSecretKey } from "./constant";
import { ApiService } from "@/service/ApiService";
import { NetworkEndpoint } from "@/service/ApiEndpoint";
import { baseURL } from "@/utils/constant";

export const formatTime = (ms) => {
    const totalSeconds = Math.max(Math.floor(ms / 1000), 0);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(
        2,
        "0"
    );
    const seconds = String(totalSeconds % 60).padStart(2, "0");
    return `${hours}:Jam ${minutes}:Menit ${seconds}:Detik`;
};

export const generateGetImageKey = (payload) => {
    const raw = loadImageSecretKey + JSON.stringify(payload);
    return CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);
};

export const getImageIdUrl = async (imagePath) => {
    if (!imagePath) throw new Error("Image path not found");

    const payload = {
        grantType: "client_credentials",
        timestamp: new Date().toISOString(),
    };

    const apiKeyImage = generateGetImageKey(payload);

    try {
        const { Signature, date } = await ApiService.post(
            baseURL,
            NetworkEndpoint.GET_SIGN_IMAGE_ID,
            payload,
            {
                "Content-Type": "application/json",
                "X-API-KEY": apiKeyImage,
            }
        );

        const responseImageId = await ApiService.get(
            baseURL,
            `${NetworkEndpoint.GET_APARTMENT_IMAGE_ID}/${imagePath}`,
            null,
            {
                "X-Signature": Signature,
                "X-Timestamp": date,
                "content-type": "multipart/form-data",
            },
            "blob"
        );

        const blob = await responseImageId;
        const result = URL.createObjectURL(blob);
        return result;
    } catch (error) {
        console.error("message error:", error);
    }
};

export const getImageUserUrl = async (imagePath) => {
    if (!imagePath) throw new Error("Image path not found");

    const payload = {
        grantType: "client_credentials",
        timestamp: new Date().toISOString(),
    };

    const apiKeyImage = generateGetImageKey(payload);

    try {
        const { Signature, date } = await ApiService.post(
            baseURL,
            NetworkEndpoint.GET_SIGN_IMAGE_USER,
            payload,
            {
                "Content-Type": "application/json",
                "X-API-KEY": apiKeyImage,
            }
        );

        const responseImageId = await ApiService.get(
            baseURL,
            `${NetworkEndpoint.GET_APARTMENT_IMAGE_USER}/${imagePath}`,
            null,
            {
                "X-Signature": Signature,
                "X-Timestamp": date,
                "content-type": "multipart/form-data",
            },
            "blob"
        );

        const blob = await responseImageId;
        const result = URL.createObjectURL(blob);
        return result;
    } catch (error) {
        console.error("message error:", error);
    }
};

export const getOptionsForType = (type, billCategory) => {
    const filteredCategory = billCategory.find(
        (category) => category.billing_type === type
    );
    return filteredCategory ? filteredCategory.categories : [];
};

export const formattedDate = (date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export const formatNumberWithDots = (value) => {
    if (value === null || value === undefined || value === "") return "";

    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

export const unformatNumberFromDots = (value) => {
    if (typeof value !== "string") return value.toString();

    return value.replace(/\./g, "");
};
