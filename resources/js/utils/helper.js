import CryptoJS from "crypto-js";
import { loadImageSecretKey } from "./constant";
import { ApiService } from "@/service/ApiService";
import { NetworkEndpoint } from "@/service/ApiEndpoint";
import { baseURL } from "@/utils/constant";

export const generateGetImageKey = (payload) => {
    const raw = loadImageSecretKey + JSON.stringify(payload);
    return CryptoJS.SHA256(raw).toString(CryptoJS.enc.Hex);
};

export const getImageIdUrl = async (imagePath) => {
    if (!imagePath) return null;

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
    if (!imagePath) return null;

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
