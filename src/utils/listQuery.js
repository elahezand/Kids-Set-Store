import mongoose from "mongoose";
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);
import paginate from "@/utils/paginate";
const escapeRegex = (text) => String(text).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");

const toDate = (value) => (/^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? new Date(`${value}T00:00:00`) : new Date(value));

const startOfDay = (value) => {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(0, 0, 0, 0);
  return date;
};

const endOfDay = (value) => {
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return null;
  date.setHours(23, 59, 59, 999);
  return date;
};

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

const searchFilter = (query = {}, fields = []) => {
  const term = String(query.q || "").trim();
  if (!term || !fields.length) return {};

  const regex = new RegExp(escapeRegex(term.slice(0, 100)), "i");
  return fields.length === 1 ? { [fields[0]]: regex } : { $or: fields.map((field) => ({ [field]: regex })) };
};

const statusFilter = (query = {}, allowed = [], field = "status") => {
  const value = query[field];
  if (!value || value === "all") return {};
  return allowed.length && !allowed.includes(value) ? {} : { [field]: value };
};

const idFilter = (query = {}, param, field = param) => {
  const value = query[param];
  return value && isValidId(value) ? { [field]: new mongoose.Types.ObjectId(value) } : {};
};

const buildListQuery = (query = {}, options = {}) => {
  const { dateField = "createdAt", statuses = [], statusField = "status", search = [], ids = {}, base = {} } = options;

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

const listLimit = (query = {}, fallback = 20, max = 100) => Math.min(Math.max(Number(query.limit) || fallback, 1), max);

const paginateList = (Model, query = {}, options = {}) => {
  const {
    defaultLimit = 20,
    maxLimit = 100,
    sort = { _id: -1 },
    populate = null,
    select = null,
    filters: extraFilters = {},
    ...listOptions
  } = options;

  return paginate(Model, {
    limit: listLimit(query, defaultLimit, maxLimit),
    cursor: query.cursor || null,
    filters: { ...buildListQuery(query, listOptions), ...extraFilters },
    sort,
    populate,
    select,
  });
};

export { paginateList, buildListQuery, dateRangeFilter, searchFilter, statusFilter, idFilter, listLimit };

export default { paginateList, buildListQuery, dateRangeFilter, searchFilter, statusFilter, idFilter, listLimit };
