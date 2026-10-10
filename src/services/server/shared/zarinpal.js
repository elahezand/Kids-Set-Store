const VERIFY_URL = process.env.ZARINPAL_VERIFY_URL || "https://payment.zarinpal.com/pg/v4/payment/verify.json";
const REQUEST_URL = process.env.ZARINPAL_API_BASE_URL || "https://payment.zarinpal.com/pg/v4/payment/request.json";
const START_PAY_URL = process.env.ZARINPAL_PAYMENT_BASE_URL || "https://payment.zarinpal.com/pg/StartPay/";

const tomanToRial = (toman) => Math.round(Number(toman || 0) * 10);

const paymentUrl = (authority) => `${START_PAY_URL.replace(/\/?$/, "/")}${authority}`;

const postJson = async (url, body) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  });
  const data = await response.json().catch(() => ({}));
  return { response, data };
};

export { tomanToRial, paymentUrl };

export const createPayment = async (amountInRial, description, mobile) => {
  const { response, data } = await postJson(REQUEST_URL, {
    merchant_id: process.env.ZARINPAL_MERCHANT_ID,
    callback_url: process.env.ZARINPAL_PAYMENT_CALLBACK_URL,
    amount: Math.round(amountInRial),
    description,
    metadata: mobile ? { mobile } : {},
  });

  if (!response.ok || (data?.errors && Object.keys(data.errors).length)) {
    throw new Error("Payment request failed");
  }

  return data;
};

export const verifyPayment = async (authority, amountInRial) => {
  let result;
  try {
    result = await postJson(VERIFY_URL, {
      merchant_id: process.env.ZARINPAL_MERCHANT_ID,
      authority,
      amount: Math.round(amountInRial),
    });
  } catch (err) {
    return { success: false, unreachable: true, message: "Payment gateway unreachable" };
  }

  const { response, data } = result;
  if (!response.ok || (data?.errors && Object.keys(data.errors).length)) {
    return { success: false, message: "Payment verification failed" };
  }
  if (data.data?.code === 100 || data.data?.code === 101) {
    return { success: true, refId: data.data.ref_id };
  }

  return { success: false, message: "Payment not verified" };
};
