export type OfferStatus = "pending" | "accepted" | "rejected";
export interface  Offer {
    _id: string;
  price: number;
  discount?: number;
  finalPrice?: number;
  stock: number;
  shipsWithinDays?: number;
  description?: string | null;
  status: OfferStatus;
  adminComment?: string | null;
  createdAt: string;
  seller?: { _id: string; username?: string; phone?: string } | string;
  product?: { _id: string; title?: string; images?: string[] } | string;
  listing?: { _id: string; title?: string; images?: string[] } | string;
  store?: { _id: string; name?: string; meta?: { ratings?: number; reviewsCount?: number } } | string;
}


export interface OffersResponse {
  success: boolean;
  data: Offer[];
  pagination?: {
    hasMore: boolean;
    limit: number;
    nextCursor: string | null;
  };
}