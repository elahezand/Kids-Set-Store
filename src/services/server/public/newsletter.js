import Newsletter from "@/model/newsletter";

const subscribe = async (email) => {
    const exists = await Newsletter.findOne({ email });

    if (exists) {
        return {
            success: false,
            status: 409,
            message: "Email already subscribed",
        };
    }

    const newsletter = await Newsletter.create({ email });

    return {
        success: true,
        data: newsletter,
    };
};

const subscribeService = {
    subscribe,
};

export default subscribeService
