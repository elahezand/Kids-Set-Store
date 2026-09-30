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

export {
    createInfo,
    updateInfo,
    deleteInfo,
};

export default {
    createInfo,
    updateInfo,
    deleteInfo,
};
