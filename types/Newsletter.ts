import { IPagination } from "./common";

export interface NewsletterSubscriber {
  _id: string;
  email: string;
  createdAt: string;
}

export interface NewsletterSubscribersResponse {
  success: boolean;
  data: NewsletterSubscriber[];
  pagination?: IPagination;
}
