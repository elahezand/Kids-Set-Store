import axios from "axios";
import { unstable_cache } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
export const useServerData = async (
  endpoint,
  cacheKey,
  revalidateTime
) => {
  if (cacheKey && revalidateTime !== undefined) {
    const fetchData = unstable_cache(
      async () => {
        const { data } = await axios.get(`${API_URL}${endpoint}`);
        return data;
      },
      [cacheKey],
      { revalidate: revalidateTime }
    );

    return fetchData();
  }

  try {
    const { data } = await axios.get(`${API_URL}${endpoint}`, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
    return data;
  } catch (error) {
    console.error("SSR fetch error:", error?.message);
    throw new Error("Data fetch failed");
  }
};
