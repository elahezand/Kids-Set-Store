import type { Id, ISODate } from "./api";

export type TicketPriority = 1 | 2 | 3;

export interface SubDepartment {
  _id: Id;
  title: string;
}

export interface Department {
  _id: Id;
  title: string;
  subDepartments: SubDepartment[];
}

export interface TicketAuthor {
  _id: Id;
  username?: string;
  email?: string;
  role?: Array<"USER" | "ADMIN"> | string;
}

export type TicketStatusFilter = "all" | "waiting" | "answered";

export interface TicketSummary {
  _id: Id;
  title: string;
  priority: TicketPriority;
  isAnswer: boolean;
  department?: { _id: Id; title: string } | null;
  subDepartment?: { _id: Id; title: string } | null;
  createdAt?: ISODate;
}

export interface TicketMessage {
  _id: Id;
  content: string;
  user?: TicketAuthor | null;
  createdAt?: ISODate;
}

export interface TicketDetail extends TicketSummary, TicketMessage {
  children: TicketMessage[];
}

export interface CreateTicketPayload {
  title: string;
  department: Id;
  subDepartment: Id;
  priority: TicketPriority;
  content: string;
}

export interface TicketReplyPayload {
  content: string;
}
