import type { Id, ISODate } from "./api";

export interface ArticleAuthor {
  _id?: Id;
  name?: string;
  username?: string;
}

export interface ArticleCategoryRef {
  _id?: Id;
  title: string;
  slug: string;
}

export interface ArticleSummary {
  _id: Id;
  title: string;
  slug?: string;
  excerpt?: string;
  cover?: string | null;
  author?: ArticleAuthor | Id | null;
  category?: ArticleCategoryRef | null;
  views?: number;
  createdAt?: ISODate;
  updatedAt?: ISODate;
}

export interface ArticleDetail extends ArticleSummary {
  content: string;
}

export interface ArticleCategoryOption {
  title: string;
  slug: string;
}

export interface ShareTarget {
  url: string;
  title: string;
  image?: string;
}

export interface ArticleListQuery {
  q?: string;
  category?: string;
  limit?: number | string;
}

export type ArticleStatusFilter = "all" | "published" | "draft";

export interface AdminArticle extends ArticleSummary {
  isPublished: boolean;
}

export interface AdminArticleDetail extends AdminArticle {
  content: string;
}

export interface ArticlePayload {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  category: Id | null;
  cover: string | null;
  isPublished: boolean;
}
