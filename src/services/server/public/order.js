import Order from "@/model/order";
import { verifyPayment } from "@/services/server/shared/zarinpal";
import { finalizeOrder } from "@/services/server/shared/order";

const STALE_CLAIM_MS = 2 * 60 * 1000;

const isFinished = (order) =>
    order.items.every((item) => item.stockReserved);

const toRial = (toman) =>
    Math.round(Number(toman || 0) * 10);

const verify = async (authority) => {
    if (!authority) {
        return {
            success: false,
            status: 400,
            message: "Missing payment authority",
        };
    }

    const order = await Order.findOne({
        "payment.authority": authority,
    });

    if (!order) {
        return {
            success: false,
            status: 404,
            message: "Order not found",
        };
    }

    if (order.paymentStatus === "paid") {
        if (isFinished(order)) {
            return {
                success: true,
                data: order,
            };
        }

        await finalizeOrder(order);
        await order.save();

        return {
            success: true,
            data: order,
        };
    }

    // Only one request may run the payment + finalize at a time
    const staleBefore = new Date(
        Date.now() - STALE_CLAIM_MS
    );

    const claimed = await Order.findOneAndUpdate(
        {
            "payment.authority": authority,
            paymentStatus: { $ne: "paid" },

            // Cancelled orders must never be charged/finalized
            status: { $ne: "cancelled" },

            $or: [
                { finalizedAt: null },
                { finalizedAt: { $lt: staleBefore } },
            ],
        },
        {
            $set: {
                finalizedAt: new Date(),
            },
        },
        {
            returnDocument: "after",
        }
    );

    if (!claimed) {
        return {
            success: true,
            data: order,
        };
    }

    const result = await verifyPayment(
        authority,
        toRial(claimed.pricing.total)
    );

    // Gateway is unreachable → leave payment pending
    // so the sweeper can retry later.
    if (!result.success && result.unreachable) {
        claimed.finalizedAt = null;
        await claimed.save();

        return {
            success: true,
            data: claimed,
        };
    }

    // Payment failed
    if (!result.success) {
        claimed.finalizedAt = null;
        claimed.paymentStatus = "failed";

        await claimed.save();

        return {
            success: true,
            data: claimed,
        };
    }

    // Mark paid BEFORE finalization.
    // If the server crashes after this point,
    // the next request can resume the finalization.
    claimed.paymentStatus = "paid";
    claimed.payment.refId = result.refId;
    claimed.payment.paidAt = new Date();

    await claimed.save();

    await finalizeOrder(claimed);
    await claimed.save();

    return {
        success: true,
        data: claimed,
    };
};

export  {
    verify,
};

export default {
    verify,
};
