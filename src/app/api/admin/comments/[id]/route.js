import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../../../configs/db";
import CommentModel from "../../../../../../model/comment";
import {
  moderateCommentSchema,
  replyCommentSchema,
} from "../../../../../../validators/comment";
import { authAdmin } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

const getId = async (params) => {
  const { id } = await params;
  return isValidObjectId(id) ? id : null;
};

const guard = async (params) => {
  const admin = await authAdmin();
  if (!admin) return { error: jsonError("Admin access required", 401) };

  const id = await getId(params);
  if (!id) return { error: jsonError("Comment not found", 404) };

  return { admin, id };
};

/* POST /api/admin/comments/:id
   Reply to a review: { body } */
export async function POST(req, { params }) {
  try {
    await connectToDB();

    const { admin, id, error } = await guard(params);
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = replyCommentSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const parent = await CommentModel.findById(id);
    if (!parent || parent.deletedAt) return jsonError("Comment not found", 404);

    if (parent.parentId) {
      return jsonError("You can only reply to a review, not to a reply", 409);
    }

    if (["rejected", "spam"].includes(parent.status)) {
      return jsonError("Approve this comment before replying to it", 409);
    }

    // Replying to a pending review approves it, so the reply is visible too
    if (parent.status === "pending") {
      parent.status = "approved";
      parent.moderation = { moderatedBy: admin._id, moderatedAt: new Date(), reason: null };
      await parent.save(); // updates the product rating
    }

    const reply = await CommentModel.create({
      user: admin._id,
      productId: parent.productId,
      parentId: parent._id,
      body: parsed.data.body,
      status: "approved",
    });

    await reply.populate("user", "name username");

    return NextResponse.json(
      { message: "Reply added successfully", data: reply },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/admin/comments/:id");
  }
}

/* PUT /api/admin/comments/:id
   Change status: { status, reason? } (reason required for rejected / deleted) */
export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const { admin, id, error } = await guard(params);
    if (error) return error;

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = moderateCommentSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const { status, reason } = parsed.data;
    const now = new Date();

    const comment = await CommentModel.findByIdAndUpdate(
      id,
      {
        status,
        moderation: {
          moderatedBy: admin._id,
          moderatedAt: now,
          reason: reason ?? (status === "spam" ? "Spam" : null),
        },
        // "deleted" soft deletes; any other status restores a deleted comment
        ...(status === "deleted"
          ? { deletedAt: now, deletedBy: admin._id }
          : { deletedAt: null, deletedBy: null }),
      },
      { new: true }
    );

    if (!comment) return jsonError("Comment not found", 404);

    return NextResponse.json({ message: `Comment ${status}`, data: comment }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "PUT /api/admin/comments/:id");
  }
}

/* DELETE /api/admin/comments/:id?reason=...
   Soft delete with a required reason */
export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const { admin, id, error } = await guard(params);
    if (error) return error;

    const reason = new URL(req.url).searchParams.get("reason")?.trim();
    if (!reason) return jsonError("A reason is required to delete a comment", 400);

    const now = new Date();

    const comment = await CommentModel.findOneAndUpdate(
      { _id: id, deletedAt: null },
      {
        status: "deleted",
        deletedAt: now,
        deletedBy: admin._id,
        moderation: { moderatedBy: admin._id, moderatedAt: now, reason },
      },
      { new: true }
    );

    if (!comment) return jsonError("Comment not found", 404);

    return NextResponse.json({ message: "Comment removed successfully" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "DELETE /api/admin/comments/:id");
  }
}