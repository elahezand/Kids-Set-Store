import User from "@/model/user";
import WalletTransaction from "@/model/walletTransaction";
import { paginateList } from "@/utils/listQuery";

const getMyWallet = async (userId, query = {}) => {
  const user = await User.findById(userId).select("wallet").lean();

  if (!user) {
    return {
      success: false,
      status: 404,
      message: "User not found",
    };
  }

  const result = await paginateList(WalletTransaction, query, {
    base: { user: userId },
    statuses: ["spend", "refund"],
    statusField: "type",
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

  const sum = (type) => totals.find((item) => item._id === type)?.total || 0;

  return {
    success: true,
    data: result.data,
    pagination: result.pagination,
    meta: {
      balance: user.wallet?.balance || 0,
      totals: {
        refunded: sum("refund"),
        spent: sum("spend"),
      },
    },
  };
};

export { getMyWallet };

export default {
  getMyWallet,
};
