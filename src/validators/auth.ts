import { z } from "zod";
const authSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
  remember: z.boolean().optional(),
});

export default authSchema;
