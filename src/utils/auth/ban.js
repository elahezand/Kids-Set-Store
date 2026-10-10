import Ban from "@/model/ban";

export const isBanned = async (phone) => Boolean(phone && (await Ban.exists({ phone })));
