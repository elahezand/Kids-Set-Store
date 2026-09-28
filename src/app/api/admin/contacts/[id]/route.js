import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../../../configs/db";
import ContactModel from "../../../../../../model/contact";
import {
  updateContactSchema,
  answerContactSchema,
} from "../../../../../../validators/contact";
import { authAdmin } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";
import sendEmail from "@/utils/sendEmail";


// Every handler here: admin + valid id
const guard = async (params) => {
  const admin = await authAdmin();
  if (!admin) return { error: jsonError("Admin access required", 401) };

  const { id } = await params;
  if (!isValidObjectId(id)) return { error: jsonError("Message not found", 404) };

  return { admin, id };
};

const POPULATE = [
  { path: "user", select: "name username" },
  { path: "handledBy", select: "name username" },
  { path: "answeredBy", select: "name username" },
];

// Escape user text before putting it inside HTML
const escapeHtml = (text = "") =>
  String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

/* GET /api/admin/contacts/:id
   Opening a new message marks it as read */
export async function GET(req, { params }) {
  try {
    await connectToDB();

    const { admin, id, error } = await guard(params);
    if (error) return error;

    const contact = await ContactModel.findById(id);
    if (!contact) return jsonError("Message not found", 404);

    if (contact.status === "new") {
      contact.status = "read";
      contact.readAt = new Date();
      contact.handledBy = admin._id;
      await contact.save();
    }

    await contact.populate(POPULATE);

    return NextResponse.json({ data: contact }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/admin/contacts/:id");
  }
}

/* POST /api/admin/contacts/:id
   Answer the message: { answer } */
export async function POST(req, { params }) {
  try {
    await connectToDB();

    const { admin, id, error } = await guard(params);
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = answerContactSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const contact = await ContactModel.findById(id);
    if (!contact) return jsonError("Contact not found", 404);

    if (contact.status === "answered") {
      return jsonError("Already answered", 400);
    }

    const { answer } = parsed.data;

    contact.status = "answered";
    contact.answer = answer;
    contact.answeredBy = admin._id;
    contact.answeredAt = new Date();

    await contact.save();

    setImmediate(() => {
      sendEmail(
        contact.email,
        `Dear ${contact.name}`,
        `<p style="white-space: pre-line;">${escapeHtml(answer)}</p>`
      ).catch((err) => console.error("Contact answer email failed:", err));
    });

    await contact.populate(POPULATE);

    return NextResponse.json(
      { message: "Answer sent successfully", data: contact },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/admin/contacts/:id");
  }
}

/* PUT /api/admin/contacts/:id */
export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const { admin, id, error } = await guard(params);
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateContactSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const contact = await ContactModel.findById(id);
    if (!contact) return jsonError("Message not found", 404);

    const { status, adminNote } = parsed.data;
    const now = new Date();

    if (adminNote !== undefined) contact.adminNote = adminNote || null;

    if (status && status !== contact.status) {
      contact.status = status;
      contact.handledBy = admin._id;

      if (!contact.readAt && status !== "new") contact.readAt = now;
      if (status === "answered") contact.answeredAt = now;
      if (status === "new") contact.readAt = null; 
    }

    await contact.save();
    await contact.populate(POPULATE);

    return NextResponse.json(
      { message: "Message updated successfully", data: contact },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "PUT /api/admin/contacts/:id");
  }
}

/* DELETE /api/admin/contacts/:id*/
export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const { id, error } = await guard(params);
    if (error) return error;

    const contact = await ContactModel.findByIdAndDelete(id);
    if (!contact) return jsonError("Message not found", 404);

    return NextResponse.json({ message: "Message removed successfully" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "DELETE /api/admin/contacts/:id");
  }
}