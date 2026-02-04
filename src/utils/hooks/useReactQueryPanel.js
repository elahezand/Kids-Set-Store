import { privateApi } from "../api";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
export const useGet = (endpoint, params = {}, options = {}) => {
    const queryKey = options.queryKey || [endpoint, params];
    return useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await privateApi.get(endpoint, { params });            
            return data;
        },
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

export const usePost = (url, options) => {
    return useMutation({
        mutationFn: async (data) => {
            const res = await privateApi.post(url, data);
            return res.data;
        },
        ...options,
    });
};
;
export const usePut = (url, options = {}) => {
    return useMutation({
        mutationFn: async ({ id, payload }) => {
            const { data } = await privateApi.put(`${url}/${id}`, payload || {});
            return data;
        },
        ...options,
    });
};


export const useDelete = (url, options = {}) => {
    return useMutation({
        mutationFn: async (id) => {
            const { data } = await privateApi.delete(`${url}/${id}`);
            return data;
        },
        ...options,
    });
};