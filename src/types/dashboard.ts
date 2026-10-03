import type { OrderListItem } from "./order";
import type { TicketSummary } from "./ticket";

export interface DashboardCounts {
  orders: number;
  tickets: number;
  comments: number;
  favorites: number;
}

export interface UserDashboard {
  counts: DashboardCounts;
  recentTickets: TicketSummary[];
  recentOrders: OrderListItem[];
}

export interface PanelNotification {
  _id: string;
  msg: string;
  see: number;
  link?: string | null;
  createdAt?: string;
}
