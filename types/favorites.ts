import { IPagination } from "./common";

export default interface FavoritesTypeResponse {
    success: boolean;
    data: {
      _id: string;
      product: {
        _id: string;
        title: string;
        slug?: string;
        price: number;
        images?: string[];
        status: string;
        shortIdentifier?: string;
        condition?: string;
        metrics?: { views?: number; sold?: number };
      };
      productType: "user_ad" | "store_product";
    }[];
    pagination?: IPagination;
  
}


