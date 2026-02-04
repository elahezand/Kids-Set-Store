import { publicApi } from "../api";
import { useQuery } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
export const useGet = (endpoint, params = {}, options = {}) => {
    const queryKey = options.queryKey || [endpoint, params];
    return useQuery({
        queryKey,
        queryFn: async () => {
            const { data } = await publicApi.get(endpoint, { params });
            return data;
        },
        staleTime: 5 * 60 * 1000,
        ...options,
    });
};

export const usePost = (url, options) => {
    return useMutation({
        mutationFn: async (data) => {
            const res = await publicApi.post(url, data);
            return res.data;
        },
        ...options,
    });
};
;
