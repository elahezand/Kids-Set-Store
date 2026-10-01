import type { Id, ISODate } from "./api";

export type Recommendation = "recommended" | "not_recommended" | "no_idea";

export interface CommentUser {
  _id?: Id;
  name?: string;
  username?: string;
  profilePicture?: string | null;
}

/* GET /api/comments/product/:product item (replies are nested one level) */
export interface ProductComment {
  _id: Id;
  user?: CommentUser | null;
  rating?: number | null;
  body: string;
  pros?: string[];
  cons?: string[];
  recommendation?: Recommendation;
  verifiedPurchase?: boolean;
  createdAt?: ISODate;
  editedAt?: ISODate | null;
  replies?: ProductComment[];
}

/* POST /api/user/comment */
export interface CreateCommentPayload {
  productId: Id;
  rating: number;
  body: string;
  recommendation?: Recommendation;
  pros?: string[];
  cons?: string[];
}

export type CommentFormValues = Omit<CreateCommentPayload, "productId">;
