
export interface StoreFormValues {
    name: string;
    phone: string;
    logo: string;
    owner: string;
    address: {
        province: string;
        city: string;
        street: string;
        postalCode: string;
        coordinates: {
            lat: number;
            lng: number;
        };
    };
}