import { api } from "@/services/interceptor";
import {
  useQuery,
  useInfiniteQuery,
  useMutation,
} from "@tanstack/react-query";
import { toast } from "sonner";

const resolveUrl = (url, data) => {
  return typeof url === "function" ? url(data) : url;
};

const isPlainObject = (value) =>
  value !== null &&
  typeof value === "object" &&
  !Array.isArray(value) &&
  Object.getPrototypeOf(value) === Object.prototype;

/*
   ERROR HANDLER
*/

const showErrorToast = (error, fallback) => {
  const err = error;

  if (err?._authToastShown) return;

  const responseData = err?.response?.data;
  let message = fallback;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    message = responseData.errors
      .map((item) => item?.message)
      .filter(Boolean)
      .join(" | ");
  } else if (responseData?.message) {
    message = responseData.message;
  }

  toast.error(message);
};

/*
   GET
   usage: useGet(url, params?, options?)
*/

export const useGet = (url, params, options) => {
  const {
    axiosConfig,
    silentError,
    errorFallback,
    queryKey: customQueryKey,
    ...queryOptions
  } = options || {};

  const queryKey = customQueryKey ?? [url, params];

  return useQuery({
    queryKey,

    queryFn: async () => {
      try {
        const { data } = await api.get(url, {
          ...axiosConfig,
          params,
          paramsSerializer: {
            indexes: null,
          },
        });

        return data;
      } catch (error) {
        if (!silentError) {
          showErrorToast(error, errorFallback || "Failed to load data");
        }

        throw error;
      }
    },

    staleTime: 5 * 60 * 1000,

    ...queryOptions,
  });
};

/*
   INFINITE GET
*/

const extractPagination = (page) => {
  if (!page || typeof page !== "object") return undefined;

  const direct = page.pagination;
  if (direct) return direct;

  const nestedData = page.data;
  if (nestedData && typeof nestedData === "object" && !Array.isArray(nestedData)) {
    return nestedData.pagination;
  }

  return undefined;
};

export const useInfiniteGet = (url, params, options) => {
  const {
    silentError,
    errorFallback,
    queryKey,
    ...restOptions
  } = options || {};

  return useInfiniteQuery({
    queryKey: queryKey ?? [url, params],

    queryFn: async ({ pageParam = null }) => {
      try {
        const { data } = await api.get(url, {
          params: {
            ...params,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
          paramsSerializer: {
            indexes: null,
          },
        });

        return data;
      } catch (error) {
        if (!silentError) {
          showErrorToast(error, errorFallback || "Failed to load data");
        }

        throw error;
      }
    },

    initialPageParam: null,

    getNextPageParam: (lastPage) => {
      const pagination = extractPagination(lastPage);
      return pagination?.hasMore ? pagination.nextCursor : undefined;
    },

    staleTime: 5 * 60 * 1000,

    ...restOptions,
  });
};

/*
   MUTATIONS (POST / PATCH / PUT / DELETE)
*/

const createMutationHook = (method) => (url, options) => {
  const { errorFallback, axiosConfig, ...restOptions } = options || {};

  return useMutation({
    mutationFn: async (data) => {
      const targetUrl = resolveUrl(url, data);

      let res;

      if (method === "delete") {
        const config =
          typeof url !== "function" && isPlainObject(data)
            ? { ...axiosConfig, data }
            : axiosConfig;

        ({ data: res } = await api.delete(targetUrl, config));
      } else {
        ({ data: res } = await api[method](targetUrl, data, axiosConfig));
      }

      return res;
    },

    onError: (error) => {
      showErrorToast(error, errorFallback || "Something went wrong");
    },

    ...restOptions,
  });
};

export const usePost = createMutationHook("post");
export const usePatch = createMutationHook("patch");
export const usePut = createMutationHook("put");
export const useDelete = createMutationHook("delete");