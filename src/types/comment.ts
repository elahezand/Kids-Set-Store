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

export type CommentStatus = "pending" | "approved" | "rejected" | "spam" | "deleted";

/* ?status= on /p-user/comments and GET /api/user/comment ("all" = no filter) */
export type CommentStatusFilter = "all" | "pending" | "approved" | "rejected";

/* GET /api/user/comment item (user panel "my comments") */
export interface MyComment {
  _id: Id;
  body: string;
  rating: number | null;
  status: CommentStatus;
  product?: { _id: Id; title: string } | null;
  createdAt?: ISODate;
}
