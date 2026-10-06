import Order from "@/model/order";
import { verifyPayment } from "@/services/server/shared/zarinpal";
import { finalizeOrder } from "@/services/server/shared/order";

const STALE_CLAIM_MS = 2 * 60 * 1000;

// stock is reserved at checkout now, so "finished" also needs finalize to have moved it past "created"
const isFinished = (order) =>
    order.status !== "created" && order.items.every((item) => item.stockReserved);

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

    const staleBefore = new Date(
        Date.now() - STALE_CLAIM_MS
    );

    const claimed = await Order.findOneAndUpdate(
        {
            "payment.authority": authority,
            paymentStatus: { $ne: "paid" },
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

    if (!result.success && result.unreachable) {
        claimed.finalizedAt = null;
        await claimed.save();

        return {
            success: true,
            data: claimed,
        };
    }

    if (!result.success) {
        claimed.finalizedAt = null;
        claimed.paymentStatus = "failed";

        await claimed.save();

        return {
            success: true,
            data: claimed,
        };
    }

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

const verifyService = {
    verify,
};

export default verifyService