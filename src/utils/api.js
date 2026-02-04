import axios from "axios";
import toast from "react-hot-toast";
import { manageError } from "./helper";
const publicApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
});

publicApi.interceptors.response.use(
    (response) => response,
    (error) => {
        const status = error.response?.status;

        if (!status) {
            toast.error("Network error or no response from server");
            return Promise.reject(error);
        }

        if (status === 401 || status === 403) {
            toast.error("Please login first");
            window.location.href = "/login-register";
            return Promise.reject(error);
        }

        if (status >= 400) {
            manageError(status);
        }

        return Promise.reject(error);
    }
);
const privateApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,

});

privateApi.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry
        ) {
            originalRequest._retry = true;
            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
                    {},
                );

                return api(originalRequest);
            } catch (err) {
                toast.error("Please LogIn ....");
                window.location.href = "/login-register";
                return Promise.reject(err);
            }
        }

        if (status !== 200) {
            manageError(status);
            return Promise.reject(error);
        }

        return Promise.reject(error);
    }
);


export {
    privateApi,
    publicApi
};