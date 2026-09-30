import User from "@/model/user";
import WalletTransaction from "@/model/walletTransaction";
import { paginate } from "@/utils/helper";
import { buildListQuery, listLimit } from "@/utils/listQuery";

const getMyWallet = async (userId, query = {}) => {
    const user = await User.findById(userId)
        .select("wallet")
        .lean();

    if (!user) {
        return {
            success: false,
            status: 404,
            message: "User not found",
        };
    }

    const filters = buildListQuery(query, {
        base: { user: userId },
        statuses: ["spend", "refund"],
        statusField: "type",
    });

    const result = await paginate(WalletTransaction, {
        limit: listLimit(query, 20),
        cursor: query.cursor,
        filters,
        populate: [
            {
                path: "order",
                select: "_id status paymentStatus pricing createdAt",
            },
        ],
        sort: { _id: -1 },
    });

    const totals = await WalletTransaction.aggregate([
        {
            $match: {
                user: user._id,
            },
        },
        {
            $group: {
                _id: "$type",
                total: {
                    $sum: "$amount",
                },
            },
        },
    ]);

    const sum = (type) =>
        totals.find((item) => item._id === type)?.total || 0;

    return {
        success: true,
        data: {
            balance: user.wallet?.balance || 0,
            totals: {
                refunded: sum("refund"),
                spent: sum("spend"),
            },
            ...result,
        },
    };
};

export {
    getMyWallet,
};

export default {
    getMyWallet,
};
