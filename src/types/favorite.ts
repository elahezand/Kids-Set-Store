import type { Id, ISODate } from "./api";
import type { ProductDoc } from "./product";

export interface FavoritePayload {
  productId: Id;
}

export interface ToggleFavoriteResult {
  isFavorited: boolean;
}

/* GET /api/user/favorites item (productId is populated, null when the product was deleted) */
export interface FavoriteEntry {
  _id: Id;
  user: Id;
  productId: ProductDoc | null;
  createdAt?: ISODate;
}
