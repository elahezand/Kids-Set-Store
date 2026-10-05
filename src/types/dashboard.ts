import type { AdminOrder, OrderListItem } from "./order";
import type { AdminTicket, TicketSummary } from "./ticket";

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

export interface AdminDashboardCounts {
  users: number;
  products: number;
  orders: number;
  tickets: number;
  waitingTickets: number;
  pendingComments: number;
  newMessages: number;
}

export interface AdminDashboard {
  counts: AdminDashboardCounts;
  revenue: { total: number; last30Days: number };
  recentOrders: AdminOrder[];
  recentTickets: AdminTicket[];
}

export interface AdminStatsPoint {
  day: string;
  orders: number;
  revenue: number;
  users: number;
}

export interface AdminStatsSeries {
  days: number;
  points: AdminStatsPoint[];
}
