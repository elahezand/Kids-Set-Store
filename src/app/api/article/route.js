import { NextResponse } from "next/server";
import connectToDB from "../../../../configs/db";
import ArticleModel from "../../../../model/article";
import {
  createArticleSchema,
  articleListQuerySchema,
} from "../../../../validators/article";
import { authAdmin } from "@/utils/serverHelper";
import handleFileUpload from "@/utils/serverFile";
import { paginate } from "@/utils/paginate";
import {
  formDataToObject,
  validationError,
  jsonError,
  handleRouteError,
} from "@/utils/apiHelpers";

// Only public fields of the user (never password, phone, ...)
const AUTHOR_FIELDS = "name username";

/* GET /api/article
   - public: only published articles
   - admin:  all articles, optional ?status=publish|unpublish */
export async function GET(req) {
  try {
    await connectToDB();

    const { searchParams } = new URL(req.url);
    const query = articleListQuerySchema.parse(
      Object.fromEntries(searchParams.entries())
    );

    const admin = await authAdmin();

    const filters = admin
      ? query.status
        ? { status: query.status }
        : {}
      : { status: "publish" };

    const result = await paginate(ArticleModel, {
      limit: query.limit,
      cursor: query.cursor,
      filters,
      sort: { _id: -1 },
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    return handleRouteError(err, "GET /api/article");
  }
}

/* POST /api/article (admin) */
export async function POST(req) {
  try {
    await connectToDB();

    const admin = await authAdmin();
    if (!admin) return jsonError("Admin access required", 401);

    const formData = await req.formData();
    const parsed = createArticleSchema.safeParse(formDataToObject(formData));

    if (!parsed.success) return validationError(parsed.error);

    const { cover, ...fields } = parsed.data;

    const isArticleExist = await ArticleModel.exists({ title: fields.title });
    if (isArticleExist) {
      return jsonError("An article with this title already exists", 409);
    }

    const coverPath = await handleFileUpload(cover);

    // Author is always the logged-in admin, never taken from the form
    const article = await ArticleModel.create({
      ...fields,
      author: admin._id,
      cover: coverPath,
    });

    await article.populate("author", AUTHOR_FIELDS);

    return NextResponse.json(
      { message: "Article created successfully", data: article },
      { status: 201 }
    );
  } catch (err) {
    return handleRouteError(err, "POST /api/article");
  }
}