import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import connectToDB from "../../../../../configs/db";
import ArticleModel from "../../../../../model/article";
import { updateArticleSchema } from "../../../../../validations/article";
import { authAdmin } from "@/utils/serverHelper";
import handleFileUpload from "@/utils/serverFile";
import {
  formDataToObject,
  validationError,
  jsonError,
  handleRouteError,
} from "@/utils/apiHelpers";

// Only public fields of the user (never password, phone, ...)
const AUTHOR_FIELDS = "name username";

const getId = async (params) => {
  const { id } = await params;
  return isValidObjectId(id) ? id : null;
};

const safeDecode = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

/* GET /api/article/:slug  (an id also works, for articles without a slug)
   - public: only if published
   - admin:  any status */
export async function GET(req, { params }) {
  try {
    await connectToDB();

    const { id: idOrSlug } = await params;

    const filter = isValidObjectId(idOrSlug)
      ? { _id: idOrSlug }
      : { slug: safeDecode(idOrSlug).toLowerCase() };

    const article = await ArticleModel.findOne(filter).populate(
      "author",
      AUTHOR_FIELDS
    );
    if (!article) return jsonError("Article not found", 404);

    if (article.status !== "publish") {
      const admin = await authAdmin();
      if (!admin) return jsonError("Article not found", 404);
    }

    return NextResponse.json(article, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/article/:id");
  }
}

/* PUT /api/article/:id (admin)
   Partial update: send only the fields that changed, cover is optional */
export async function PUT(req, { params }) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const id = await getId(params);
    if (!id) return jsonError("Article not found", 404);

    const formData = await req.formData();
    const parsed = updateArticleSchema.safeParse(
      formDataToObject(formData, { skipEmpty: true })
    );

    if (!parsed.success) return validationError(parsed.error);

    const article = await ArticleModel.findById(id);
    if (!article) return jsonError("Article not found", 404);

    const { cover, ...fields } = parsed.data;

    if (fields.title && fields.title !== article.title) {
      const isTitleTaken = await ArticleModel.exists({
        title: fields.title,
        _id: { $ne: id },
      });

      if (isTitleTaken) {
        return jsonError("An article with this title already exists", 409);
      }
    }

    Object.assign(article, fields);

    if (cover) {
      article.cover = await handleFileUpload(cover);
    }

    // save() (not findOneAndUpdate) so the model hooks run: publishedAt, slug
    await article.save();
    await article.populate("author", AUTHOR_FIELDS);

    return NextResponse.json(
      { message: "Article updated successfully", data: article },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "PUT /api/article/:id");
  }
}

/* DELETE /api/article/:id (admin) */
export async function DELETE(req, { params }) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const id = await getId(params);
    if (!id) return jsonError("Article not found", 404);

    const article = await ArticleModel.findByIdAndDelete(id);
    if (!article) return jsonError("Article not found", 404);

    return NextResponse.json(
      { message: "Article removed successfully" },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, "DELETE /api/article/:id");
  }
}