export interface SiteInfo {
  phone: string;
  email: string;
  logo: string;
  address?: string;
  socials?: {
    instagram?: string;
    telegram?: string;
    linkedin?: string;
  };
}

export interface PublicStats {
  activeProducts: number;
  activeUsers: number;
  successfulDeals: number;
  todayProducts: number;
  averageRating: number;
}

export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  body: string;
}

export interface NewsletterPayload {
  email: string;
}
