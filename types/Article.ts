import { IPagination } from "./common";

export interface IArticleCategory {
  _id: string;
  title: string;
  slug: string;
}

export interface IArticle {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: IArticleCategory | string | null;
  isPublished: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticlesResponse {
  success: boolean;
  data: IArticle[];
  pagination?: IPagination;
}

export interface ArticleResponse {
  success: boolean;
  data: IArticle;
}

export interface CreateArticlePayload {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category?: string | null;
  isPublished?: boolean;
}

export interface UpdateArticlePayload {
  _id: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  category?: string | null;
  isPublished?: boolean;
}

export interface ArticleMutationResponse {
  success: boolean;
  data: IArticle;
}

export interface ArticleFormState {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  isPublished: boolean;
}
