import { z } from "zod";

/* POST /api/favorite */
export const addFavoriteSchema = z.object({
  productId: z.string().trim().regex(/^[a-f\d]{24}$/i, "Invalid product"),
});