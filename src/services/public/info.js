import Info from "@/model/info";

const getInfo = async () => {
    return Info.findOne({ key: "main" }).lean();
};

export {
    getInfo,
};

export default {
    getInfo,
};
