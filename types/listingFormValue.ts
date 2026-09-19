export interface FormValues {
    snapshot: {
        title: string;
        description: string;
        images: File[];
        specs: Record<string, string | boolean>;
        categoryPath: string[];
    };
    location: {
        state: string;
        city: string;
        lat?: number | null;
        lng?: number | null;
    };
    price: number;
    shipping: {
        type: "standard" | "express";
        cost: number;
    };
    condition: "new" | "used";
}