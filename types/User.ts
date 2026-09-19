import { IStore } from "./Store"
import { IPagination } from "./common";

export interface IAddress {
  _id: string;   
  name: string;
  postalCode: string;
  address: string;
  city: string;
  state: string;
}

export interface IUser {
    _id: string;
    username?: string;
    phone: string;
    email?: string;
    role: ("USER" | "ADMIN" | "SELLER")[];
    store?: IStore | null;
    addresses: IAddress[];
    profilePicture?: string | null;
    refreshToken?: string;
    meta?: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
}

export interface UserType {
    success: boolean;
    data: {
        user: IUser;
    };
}
export interface AdminUsersResponse {
    success: boolean;
    data: IUser[];
    pagination?: IPagination;

}
export type CreateAddressPayload = Omit<IAddress, "_id" | "id">;



export type UpdateAddressPayload = Partial<IAddress> & {
    id: string;
};

