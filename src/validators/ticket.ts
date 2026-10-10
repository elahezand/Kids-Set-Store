import { z } from "zod";
import { dateRangeQuery } from "@/validators/_shared";

export const ticketValidationSchema = z.object({
  title: z.string().trim().min(3, "Subject is too short").max(200, "Subject is too long"),
  department: z.string().min(1, "Choose a department"),
  subDepartment: z.string().min(1, "Choose a sub-department"),
  priority: z.coerce.number().int().min(1, "Choose a priority").max(3, "Choose a priority"),
  content: z.string().trim().min(5, "Message is too short").max(5000, "Message is too long"),
});

export const adminTicketsQuerySchema = z.object({
  ...dateRangeQuery,
  status: z.enum(["waiting", "answered"]).optional().catch(undefined),
  q: z.string().trim().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).catch(15),
  cursor: z.string().trim().min(1).optional().catch(undefined),
});

export const ticketReplySchema = z.object({
  content: z.string().trim().min(3, "Message is too short").max(5000, "Message is too long"),
});
