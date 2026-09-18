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
        const res = await fetch(`${API_URL}${endpoint}`);
        if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
        return res.json();
      },
      [cacheKey],
      { revalidate: revalidateTime }
    );

    return fetchData();
  }

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Fetch failed with status ${res.status}`);
    return res.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("SSR fetch error:", message);
    throw new Error("Data fetch failed");
  }
};


