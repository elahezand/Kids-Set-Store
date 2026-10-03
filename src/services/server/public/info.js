import Info from "@/model/info";
import { remember, CACHE_KEYS } from "@/utils/cache";

const getInfo = async () =>
    remember(CACHE_KEYS.info, 600, () => Info.findOne({ key: "main" }).lean());

const infoService = {
    getInfo,
};

export default infoService;
