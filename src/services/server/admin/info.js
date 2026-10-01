import invalidateCache, { CACHE_KEYS } from "@/utils/cache";
import Info from "@/model/info";

const createInfo = async (data) => {
    const exists = await Info.findOne({
        key: "main",
    });

    if (exists) {
        return {
            success: false,
            status: 409,
            message: "Info already exists",
        };
    }

    const info = await Info.create({
        key: "main",
        ...data,
    });

    return {
        success: true,
        data: info,
    };
};

const updateInfo = async (data) => {
    const allowedFields = [
        "phone",
        "email",
        "logo",
        "address",
        "socials",
    ];

    const update = {};

    for (const key of allowedFields) {
        if (data[key] !== undefined) {
            update[key] = data[key];
        }
    }

    const info = await Info.findOneAndUpdate(
        { key: "main" },
        { $set: update },
        {
            returnDocument: "after",
            runValidators: true,
            upsert: true,
        }
    );

    return {
        success: true,
        data: info,
    };
};

const deleteInfo = async () => {
    return {
        success: false,
        status: 403,
        message: "Deleting singleton config is not allowed",
    };
};



// every successful write clears the cached public copy (services/server/public)
const clearsCache = (fn) => async (...args) => {
    const result = await fn(...args);
    if (result?.success !== false) await invalidateCache(CACHE_KEYS.info);
    return result;
};

const createInfoCached = clearsCache(createInfo);
const deleteInfoCached = clearsCache(deleteInfo);
const updateInfoCached = clearsCache(updateInfo);

export {
    createInfoCached as createInfo,
    deleteInfoCached as deleteInfo,
    updateInfoCached as updateInfo,
};

export default {
    createInfo: createInfoCached,
    deleteInfo: deleteInfoCached,
    updateInfo: updateInfoCached,
};
