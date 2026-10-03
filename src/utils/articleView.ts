import { ROUTES } from "@/utils/constants";
import type { ArticleSummary } from "@/types";

const OBJECT_ID = /^[a-f\d]{24}$/i;
const FALLBACK_AUTHOR = "Set Kids";

export const articleHref = (article: Pick<ArticleSummary, "slug" | "_id">) =>
  ROUTES.article(article.slug || String(article._id));

export const getAuthorName = (author: ArticleSummary["author"]): string => {
  if (!author) return FALLBACK_AUTHOR;
  if (typeof author === "object") return author.name || author.username || FALLBACK_AUTHOR;
  return OBJECT_ID.test(author) ? FALLBACK_AUTHOR : author;
};
