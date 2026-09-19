export interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone: string;
  body: string;
  status: "pending" | "answered";
  answer?: string | null;
  createdAt: string;
}

export interface ContactsResponse {
  success: boolean;
  data: ContactMessage[];
  pagination?: {
    hasMore: boolean;
    limit: number;
    nextCursor: string | null;
  };
}

export interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  body: string;
}