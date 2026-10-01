import Info from "@/model/info";
import { remember, CACHE_KEYS } from "@/utils/cache";

// cached in Redis for 10 minutes; admin info writes clear it
const getInfo = async () =>
    remember(CACHE_KEYS.info, 600, () => Info.findOne({ key: "main" }).lean());

export {
    getInfo,
};

export default {
    getInfo,
};
