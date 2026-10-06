import { z } from "zod";
import { cursorQuerySchema } from "@/validators/_shared";

export const adminCartsQuerySchema = cursorQuerySchema.extend({
    status: z.enum(["active", "abandoned", "converted"]).optional().catch(undefined),
});
