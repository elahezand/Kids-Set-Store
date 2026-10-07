import { cache } from "react";
import connectToDB from "@/configs/db";
import Info from "@/model/info";
import { remember, CACHE_KEYS } from "@/utils/cache";
import { toPlain } from "@/utils/format";

const getInfo = async () =>
    remember(CACHE_KEYS.info, 600, () => Info.findOne({ key: "main" }).lean());

const getSiteInfo = cache(async () => {
    try {
        await connectToDB();
        return toPlain(await getInfo());
    } catch (error) {
        console.error("[site-info] could not load site info:", error);
        return null;
    }
});

const infoService = {
    getInfo,
    getSiteInfo,
};

export default infoService;
