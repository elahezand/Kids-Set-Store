const mongoose = require("mongoose");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (text) => String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

/** Start of the given day (or null when the value isn't a date) */
const startOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

/** End of the given day, so "to=2026-09-01" includes everything that happened that day */
const endOfDay = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(23, 59, 59, 999);
  return date;
};

/**
 * Date range used by every dashboard table: ?from=2026-09-01&to=2026-09-30
 * `preset` is a shortcut the UI sends instead of two dates: today | 7d | 30d | 90d
 */
const dateRangeFilter = (query = {}, field = "createdAt") => {
  const range = {};

  if (query.preset && query.preset !== "all") {
    const days = { today: 0, "7d": 6, "30d": 29, "90d": 89 }[query.preset];
    if (days !== undefined) {
      const from = new Date();
      from.setDate(from.getDate() - days);
      from.setHours(0, 0, 0, 0);
      return { [field]: { $gte: from } };
    }
  }

  const from = query.from ? startOfDay(query.from) : null;
  const to = query.to ? endOfDay(query.to) : null;
  if (from) range.$gte = from;
  if (to) range.$lte = to;

  return Object.keys(range).length ? { [field]: range } : {};
};

/** Case-insensitive "contains" search across the given fields */
const searchFilter = (query = {}, fields = []) => {
  const term = String(query.q || "").trim();
  if (!term || !fields.length) return {};

  const regex = new RegExp(escapeRegex(term.slice(0, 100)), "i");
  return fields.length === 1
    ? { [fields[0]]: regex }
    : { $or: fields.map((field) => ({ [field]: regex })) };
};

/** ?status=... , ignored when it isn't one of the allowed values or is "all" */
const statusFilter = (query = {}, allowed = [], field = "status") => {
  const value = query[field];
  if (!value || value === "all") return {};
  return allowed.length && !allowed.includes(value) ? {} : { [field]: value };
};

/** ?<field>=<objectId> (category, store, user, ...) */
const idFilter = (query = {}, param, field = param) => {
  const value = query[param];
  return value && isValidId(value) ? { [field]: new mongoose.Types.ObjectId(value) } : {};
};

/**
 * One entry point for every table in the dashboards.
 *
 *   buildListQuery(req.query, {
 *     dateField: "createdAt",
 *     statuses: ["pending", "approved"],
 *     search: ["title", "slug"],
 *     ids: { categoryId: "categoryPath", storeId: "store" },
 *     base: { user: userId },
 *   })
 */
const buildListQuery = (query = {}, options = {}) => {
  const {
    dateField = "createdAt",
    statuses = [],
    statusField = "status",
    search = [],
    ids = {},
    base = {},
  } = options;

  const idFilters = Object.entries(ids).reduce(
    (acc, [param, field]) => ({ ...acc, ...idFilter(query, param, field) }),
    {}
  );

  return {
    ...base,
    ...dateRangeFilter(query, dateField),
    ...statusFilter(query, statuses, statusField),
    ...searchFilter(query, search),
    ...idFilters,
  };
};

/** limit shared by the tables (default 20, never above max) */
const listLimit = (query = {}, fallback = 20, max = 100) =>
  Math.min(Math.max(Number(query.limit) || fallback, 1), max);

module.exports = {
  buildListQuery,
  dateRangeFilter,
  searchFilter,
  statusFilter,
  idFilter,
  listLimit,
};
