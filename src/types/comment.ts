import type { Id, ISODate } from "./api";

export type Recommendation = "recommended" | "not_recommended" | "no_idea";

export interface CommentUser {
  _id?: Id;
  name?: string;
  username?: string;
  profilePicture?: string | null;
}

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

export type CommentStatusFilter = "all" | "pending" | "approved" | "rejected";

export interface MyComment {
  _id: Id;
  body: string;
  rating: number | null;
  status: CommentStatus;
  product?: { _id: Id; title: string } | null;
  createdAt?: ISODate;
}

export type AdminCommentStatusFilter = "all" | Exclude<CommentStatus, "deleted"> | "replied";

export interface AdminComment {
  _id: Id;
  body: string;
  rating: number | null;
  status: CommentStatus;
  user?: { _id: Id; username?: string; phone?: string } | null;
  product?: { _id: Id; title: string; images?: string[] } | null;
  moderation?: { rejectReason?: string | null } | null;
  createdAt?: ISODate;
  replies?: AdminCommentReply[];
}

export interface AdminCommentReply {
  _id: Id;
  body: string;
  user?: { _id: Id; username?: string } | null;
  createdAt?: ISODate;
}

export interface ModerateCommentPayload {
  id: Id;
  status: "approved" | "rejected" | "spam";
  reason?: string;
}

export interface ReplyCommentPayload {
  id: Id;
  body: string;
}
