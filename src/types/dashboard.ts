import type { OrderListItem } from "./order";
import type { TicketSummary } from "./ticket";

/* services/server/user/dashboard getDashboard -> /p-user */
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

/* GET /api/user/notification item (model/notification) — panel topbar bell */
export interface PanelNotification {
  _id: string;
  msg: string;
  /** 0 = unread, 1 = seen */
  see: number;
  link?: string | null;
  createdAt?: string;
}
