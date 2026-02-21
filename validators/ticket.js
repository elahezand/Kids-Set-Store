import { z } from "zod";

// Zod validation schema

export const ticketValidationSchema = z.object({
    title: z.string().min(3, "Title too short").max(200),
    department: z.string().min(1, "Department required"),
    subDepartment: z.string().min(1, "SubDepartment required"),
    priority: z.string().min(1, "SubDepartment required"),
    content: z.string().min(5, "Content too short"),
});