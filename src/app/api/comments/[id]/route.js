import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../../configs/db";
import CommentModel from "../../../../../model/comment";
import { updateOwnCommentSchema } from "../../../../../validators/comment";
import { getMe } from "@/utils/serverHelper";
import { validationError, jsonError, handleRouteError } from "@/utils/apiHelpers";

const getId = async (params) => {
  const { id } = await params;
  return isValidObjectId(id) ? id : null;
};

/* PUT /api/comment/:id (owner)
   Edit own review while it's still pending */
export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) return jsonError("Please log in", 401);

    const id = await getId(params);
    if (!id) return jsonError("Comment not found", 404);

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body", 400);

    const parsed = updateOwnCommentSchema.safeParse(body);
    if (!parsed.success) return validationError(parsed.error);

    const comment = await CommentModel.findOne({ _id: id, user: user._id, deletedAt: null });
    if (!comment) return jsonError("Comment not found", 404);

    if (comment.status !== "pending") {
      return jsonError("Only pending comments can be edited", 409);
    }

    Object.assign(comment, parsed.data);
    await comment.save(); // sets editedAt

    return NextResponse.json(
      { message: "Comment updated successfully", data: comment },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "PUT /api/comment/:id");
  }
}

/* DELETE /api/comment/:id (owner)
   Soft delete own comment, reason is "Deleted by user" */
export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const user = await getMe();
    if (!user) return jsonError("Please log in", 401);

    const id = await getId(params);
    if (!id) return jsonError("Comment not found", 404);

    const now = new Date();

    // findOneAndUpdate -> the model hook updates the product rating
    const comment = await CommentModel.findOneAndUpdate(
      { _id: id, user: user._id, deletedAt: null },
      {
        status: "deleted",
        deletedAt: now,
        deletedBy: user._id,
        moderation: { moderatedBy: user._id, moderatedAt: now, reason: "Deleted by user" },
      },
      { new: true }
    );

    if (!comment) return jsonError("Comment not found", 404);

    return NextResponse.json({ message: "Comment removed successfully" }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "DELETE /api/comment/:id");
  }
}