import { z } from "zod";

/** ?limit=20&cursor=... — shared by every cursor-paginated admin list. */
export const cursorQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).optional(),
    cursor: z.string().optional(),
});
