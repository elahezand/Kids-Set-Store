import { z } from "zod";

/* POST /api/user/tickets  (also used by the "open a ticket" form) */
export const ticketValidationSchema = z.object({
    title: z.string().trim().min(3, "Subject is too short").max(200, "Subject is too long"),
    department: z.string().min(1, "Choose a department"),
    subDepartment: z.string().min(1, "Choose a sub-department"),
    // <select> sends "1" | "2" | "3", the API stores a number
    priority: z.coerce.number().int().min(1, "Choose a priority").max(3, "Choose a priority"),
    content: z.string().trim().min(5, "Message is too short").max(5000, "Message is too long"),
});

/* POST /api/user/tickets/:id/answer */
export const ticketReplySchema = z.object({
    content: z.string().trim().min(3, "Message is too short").max(5000, "Message is too long"),
});
