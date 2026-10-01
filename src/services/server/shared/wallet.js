const User = require("@/model/user");
const WalletTransaction = require("@/model/walletTransaction");
const logger = require("@/utils/logger");

const walletSpentOn = async (orderId) => {
  const tx = await WalletTransaction.findOne({
    order: orderId,
    type: "spend",
  }).lean();

  return tx ? tx.amount : 0;
};

const spendFromWallet = async (userId, orderId, amount) => {
  if (!amount || amount <= 0) return 0;
  const alreadySpent = await walletSpentOn(orderId);

  if (alreadySpent > 0) {
    return alreadySpent;
  }

  const result = await User.updateOne(
    {
      _id: userId,
      "wallet.balance": { $gte: amount },
    },
    {
      $inc: {
        "wallet.balance": -amount,
      },
    }
  );

  if (result.modifiedCount === 0) {
    return 0;
  }

  try {
    await WalletTransaction.create({
      user: userId,
      order: orderId,
      type: "spend",
      amount,
    });

    return amount;
  } catch (err) {
    if (err?.code === 11000) {
      return amount;
    }

    await User.updateOne(
      { _id: userId },
      {
        $inc: {
          "wallet.balance": amount,
        },
      }
    );

    logger.error(
      `[wallet] could not record spend for order ${orderId}: ${err}`
    );

    throw err;
  }
};

/** Puts money back into the wallet (refund / failed checkout). Runs once per order. */
const refundToWallet = async (userId, orderId, amount, note = "") => {
  if (!amount || amount <= 0) return 0;

  try {
    await WalletTransaction.create({ user: userId, order: orderId, type: "refund", amount, note });
  } catch (err) {
    if (err?.code === 11000) return 0;
    throw err;
  }

  await User.updateOne({ _id: userId }, { $inc: { "wallet.balance": amount } });
  return amount;
};

module.exports = {
  walletSpentOn,
  spendFromWallet,
  refundToWallet,
};
