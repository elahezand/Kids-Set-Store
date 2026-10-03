export const queryKeys = {
  cart: ["cart"] as const,
  comments: (productId: string) => ["comments", productId] as const,
  products: (filters: object) => ["products", filters] as const,
  articles: (filters: object) => ["articles", filters] as const,
  favorites: ["favorites"] as const,
  favoriteCount: ["favorites", "count"] as const,
  favoriteIds: ["favorites", "ids"] as const,
  myOrders: (filters: object = {}) => ["my-orders", filters] as const,
  myComments: (filters: object = {}) => ["my-comments", filters] as const,
  myTickets: (filters: object = {}) => ["my-tickets", filters] as const,
  departments: ["departments"] as const,
  notifications: ["notifications"] as const,
};
