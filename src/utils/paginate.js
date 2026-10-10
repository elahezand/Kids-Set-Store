import mongoose from "mongoose";
const MAX_LIMIT = 99;
const DEFAULT_LIMIT = 21;

const getPath = (obj, path) => path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), obj);

const encodeCursor = (values) => Buffer.from(JSON.stringify(values)).toString("base64url");

const toCursorValue = (value) => {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return String(value);
  return value;
};

const decodeCursor = (cursor) => {
  try {
    const parsed = JSON.parse(Buffer.from(String(cursor), "base64url").toString("utf8"));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

const revive = (key, value) => {
  if (value === null || value === undefined) return value;
  if (key === "_id" && mongoose.isValidObjectId(value)) {
    return new mongoose.Types.ObjectId(String(value));
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return value;
};

const normalizeSort = (sort) => {
  const entries = Object.entries(sort || {}).map(([key, dir]) => [key, Number(dir) === 1 || dir === "asc" ? 1 : -1]);
  if (!entries.some(([key]) => key === "_id")) entries.push(["_id", -1]);
  return entries;
};

const buildCursorCondition = (sortEntries, values) => {
  const or = sortEntries.map(([key, dir], index) => {
    const condition = {};
    for (let i = 0; i < index; i++) {
      const [prevKey] = sortEntries[i];
      condition[prevKey] = values[i];
    }
    condition[key] = dir === 1 ? { $gt: values[index] } : { $lt: values[index] };
    return condition;
  });
  return { $or: or };
};

const paginate = async (
  Model,
  { limit, cursor = null, filters = {}, sort = { createdAt: -1 }, populate = null, select = null } = {}
) => {
  const safeLimit = Math.min(Math.max(Number(limit) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const sortEntries = normalizeSort(sort);
  const sortObject = Object.fromEntries(sortEntries);

  const query = { ...filters };

  if (cursor) {
    const decoded = decodeCursor(cursor);
    let condition = null;

    if (decoded && decoded.length === sortEntries.length) {
      const values = decoded.map((value, i) => revive(sortEntries[i][0], value));
      condition = buildCursorCondition(sortEntries, values);
    } else if (!decoded) {
      const [firstKey, firstDir] = sortEntries[0];
      condition = { [firstKey]: firstDir === 1 ? { $gt: cursor } : { $lt: cursor } };
    }

    if (condition) query.$and = [...(query.$and || []), condition];
  }

  let dbQuery = Model.find(query)
    .sort(sortObject)
    .limit(safeLimit + 1);

  if (select) dbQuery = dbQuery.select(select);
  if (populate) dbQuery = dbQuery.populate(populate);

  const docs = await dbQuery.lean();

  const hasMore = docs.length > safeLimit;
  const data = hasMore ? docs.slice(0, safeLimit) : docs;
  const last = data[data.length - 1];

  const nextCursor =
    hasMore && last ? encodeCursor(sortEntries.map(([key]) => toCursorValue(getPath(last, key)))) : null;

  return {
    data,
    pagination: {
      limit: safeLimit,
      nextCursor,
      hasMore,
    },
  };
};

export { paginate };

export default paginate;
