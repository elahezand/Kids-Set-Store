export const hasRole = (role: unknown, name: "USER" | "ADMIN"): boolean =>
  Array.isArray(role) ? role.includes(name) : role === name;

export const isAdmin = (user: { role?: unknown } | null | undefined): boolean => hasRole(user?.role, "ADMIN");

export const roleLabel = (role: unknown): string => (hasRole(role, "ADMIN") ? "Admin" : "User");
