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

/* list item (GET /api/articles, content not included) */
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

export interface ArticleShareLinks {
  url: string;
  title: string;
  image: string;
}

/* GET /api/articles query */
export interface ArticleListQuery {
  q?: string;
  category?: string; // category slug
  limit?: number | string;
}
