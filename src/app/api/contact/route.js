import { NextResponse } from "next/server";
import connectToDB from "../../../../configs/db";
import ContactModel from "../../../../model/contact";
import { contactValidationSchema } from "../../../../validators/contact";
import { getMe } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

// Same email can send one message per minute
const RATE_LIMIT_MS = 60 * 1000;

/* POST /api/contact (public, guests and logged-in users)
   Body: { name, email, phone, company?, body } */
export async function POST(req) {
  try {
    await connectToDB();

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = contactValidationSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const data = parsed.data;

    const recentMessage = await ContactModel.exists({
      email: data.email.toLowerCase(),
      createdAt: { $gt: new Date(Date.now() - RATE_LIMIT_MS) },
    });
    if (recentMessage) {
      return jsonError("Please wait a minute before sending another message", 429);
    }

    const user = await getMe().catch(() => null);
    await ContactModel.create({ ...data, user: user?._id ?? null });

    return NextResponse.json(
      { message: "Your message was sent successfully" },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/contact");
  }
}