import type { Id, ISODate } from "./api";

/* model/ticket.js, model/department.js, model/subDepartment.js */

/** 1 = low, 2 = medium, 3 = high */
export type TicketPriority = 1 | 2 | 3;

export interface SubDepartment {
  _id: Id;
  title: string;
}

/* GET /api/user/departments (each department carries its sub-departments) */
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

/* list item: GET /api/user/tickets */
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

/* GET /api/user/tickets/:id  (first message + replies) */
export interface TicketDetail extends TicketSummary, TicketMessage {
  children: TicketMessage[];
}

/* POST /api/user/tickets */
export interface CreateTicketPayload {
  title: string;
  department: Id;
  subDepartment: Id;
  priority: TicketPriority;
  content: string;
}

/* POST /api/user/tickets/:id/answer */
export interface TicketReplyPayload {
  content: string;
}
