/* model/info.js (site contact info) */
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

/* services/server/public/stats */
export interface PublicStats {
  activeProducts: number;
  activeUsers: number;
  successfulDeals: number;
  todayProducts: number;
  averageRating: number;
}

/* POST /api/contacts */
export interface ContactPayload {
  name: string;
  email: string;
  phone: string;
  body: string;
}

/* POST /api/newsletters */
export interface NewsletterPayload {
  email: string;
}
