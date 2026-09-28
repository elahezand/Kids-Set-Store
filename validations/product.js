import { z } from "zod";

const transformToArray = (val) => {
  if (typeof val === "string") {
    return val.split(",").map((item) => item.trim()).filter(Boolean);
  }
  return val;
};

export const productSchema = z.object({
  name: z.string().min(3),
  price: z.preprocess((val) => Number(val), z.number()),
  shortDescription: z.string().min(5),
  longDescription: z.string().min(10),
  color: z.string().min(1),
  material: z.string().min(1),
  
  tags: z.preprocess(transformToArray, z.array(z.string())),
  availableSizes: z.preprocess(transformToArray, z.array(z.string())),
  
  categoryPath: z.preprocess(
    (val) => (typeof val === "string" ? JSON.parse(val) : val), 
    z.array(z.string())
  ),
  
  isAvailable: z.any(),
});