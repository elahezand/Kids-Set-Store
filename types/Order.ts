export type OrderStatus = "created" | "processing" | "shipped" | "completed" | "cancelled"

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type PaymentMethod = "cash" | "zarinpal";

export interface IOrderFulfillment {
  status: "pending" | "shipped";
  trackingCode: string | null;
  shippedAt: string | Date | null;
}

export interface IOrderItem {
  product: string;
  variant: string;
  quantity: number;
  price: number;
  seller?: string;
  selectedColor?: string;
  selectedSize?: string;
  fulfillment?: IOrderFulfillment;
  /** Snapshot taken at checkout from the offer's `shipsWithinDays` (or a
   *  default) — the date the seller/admin has committed to ship by. */
  estimatedShipBy?: string | Date | null;
  /** True when no store ever claimed this item via an offer AND it's a
   *  catalog store_product (not a personal user_ad) — meaning the site
   *  itself is responsible for shipping it. Computed once at checkout. */
  needsAdminShipment?: boolean;
}

export interface ICoupon {
  code: string;
  discountType: "fixed" | "percent";
  discountValue: number;
  maxDiscount?: number;
}

export interface IPricing {
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
}

export interface IShippingAddress {
  name: string;
  postalCode: string;
  location: {
    lat: number;
    lng: number;
  };
  address: string;
  state: string;
  city: string;
}

export interface IPayment {
  authority: string | null;
  refId: string | null;
  paidAt: string | Date | null;
}

export interface IOrder {
  _id: string;
  user: string;
  items: IOrderItem[];
  coupon: ICoupon | null;
  pricing: IPricing;
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  payment: IPayment;
  status: OrderStatus;
  isDelivered: boolean;
  deliveredAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}


export interface OrdersResponse {
    success: boolean;
    data: IOrder[];
    pagination?: {
      hasMore: boolean;
      limit: number;
      nextCursor: string | null;
    };

}

export interface AdminOrdersResponse {
  success: boolean;
  data: (IOrder & { hasPendingAdminItems?: boolean })[];
  pagination?: {
    hasMore: boolean;
    limit: number;
    nextCursor: string | null;
  };
}

/* ADMIN — GET /orders/admin/:id is populated for the order detail page:
   product, seller (Store), and buyer info are all real objects, not just
   ids. */
export interface IAdminOrderItem extends Omit<IOrderItem, "product" | "seller"> {
  _id: string;
  product: { _id: string; title?: string; images?: string[] } | string;
  seller: { _id: string; name?: string; slug?: string } | string | null;
}

export interface IAdminOrder extends Omit<IOrder, "items" | "user"> {
  items: IAdminOrderItem[];
  user: { _id: string; username?: string; phone?: string } | string;
}

export interface AdminOrderResponse {
  success: boolean;
  data: IAdminOrder;
}

/* SELLER —*/
export interface ISellerOrderItem {
  _id: string;
  product: { _id: string; title?: string; images?: string[] } | string;
  variant: string | null;
  quantity: number;
  price: number;
  seller?: string;
  selectedColor?: string;
  selectedSize?: string;
  fulfillment?: IOrderFulfillment;
  estimatedShipBy?: string | Date | null;
}

export interface ISellerOrder extends Omit<IOrder, "items" | "user"> {
  items: ISellerOrderItem[];
  user: { _id: string; username?: string; phone?: string } | string;
  mySubtotal: number;
  trackingCode?:string,
  myFulfillmentStatus: "pending" | "partial" | "shipped";
}

export interface SellerOrdersResponse {
  success: boolean;
  data: ISellerOrder[];
  pagination?: {
    hasMore: boolean;
    limit: number;
    nextCursor: string | null;
  };
}