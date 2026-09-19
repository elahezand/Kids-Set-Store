import { IPagination } from "./common";
import { ListingProps } from "./Listings";

export interface IStoreAddress {
    province?: string | null;
    city?: string | null;
    street?: string | null;
    postalCode?: string | null;
    coordinates?: {
        lat?: number | null;
        lng?: number | null;
    };
}

export interface IStore {
    _id: string;
    owner: string;
    name: string;
    slug?: string;
    logo?: string | null;
    address?: IStoreAddress;
    phone?: string | null;
    isVerified?: boolean;
    meta?: {
        ratings?: number;
        reviewsCount?: number;
    };
}

export interface StoreResponse {
    success: boolean;
    data: IStore;
}

export interface AdminStoreRow extends Omit<IStore, "owner"> {
    owner: { _id: string; username?: string; phone?: string } | string;
}

export interface AdminStoresResponse {
    success: boolean;
    data: AdminStoreRow[];
    pagination?: IPagination;
}

export interface StoresResponse {
    success: boolean;
    data: IStore[];
    pagination?: IPagination;
}

// Shape returned by GET /stores/slug/:slug — a single store plus a page of
// its listings. The backend spreads `{ success, store, data, pagination }`
// rather than nesting the store under `data`, since the endpoint naturally
// returns two distinct entities (the store, and its paginated listings).
export interface StoreDetailResponse {
    success: boolean;
    store: IStore;
    data: ListingProps[];
    pagination?: IPagination;
}

export interface StoreProductsResponse {
    data: ListingProps[];
    pagination?: IPagination;
}

export interface StoreProductsSectionProps {
    slug: string;
    initialData: ListingProps[];
    initialPagination: IPagination | null;
}
