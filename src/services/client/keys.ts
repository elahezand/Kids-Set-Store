/* React Query keys shared by every client service (invalidate with the same key) */
export const queryKeys = {
  cart: ["cart"] as const,
  comments: (productId: string) => ["comments", productId] as const,
  products: (filters: object) => ["products", filters] as const,
  articles: (filters: object) => ["articles", filters] as const,
  favorites: ["favorites"] as const,
};
