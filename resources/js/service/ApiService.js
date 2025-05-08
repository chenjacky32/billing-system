import axios from "axios";

export const ApiService = {
    get: async function (
        baseURL,
        url,
        params,
        header = {},
        responseType = "json"
    ) {
        const response = await axios
            .create({
                baseURL,
                headers: {
                    "x-requested-with": undefined,
                    ...header,
                },
            })
            .get(url, { params, responseType });
        return response.data;
    },

    post: async function (baseURL, url, data, header = {}) {
        const response = await axios
            .create({
                baseURL,
                headers: {
                    "x-requested-with": undefined,
                    ...header,
                },
            })
            .post(url, data);
        return response.data;
    },

    put: async function (baseURL, url, data, header = {}) {
        const response = await axios
            .create({
                baseURL,
                headers: {
                    "x-requested-with": undefined,
                    ...header,
                },
            })
            .put(url, data);
        return response.data;
    },

    delete: async function (baseURL, url, header = {}) {
        const response = await axios
            .create({
                baseURL,
                headers: {
                    "x-requested-with": undefined,
                    ...header,
                },
            })
            .delete(url);
        return response.data;
    },
};
