/**
 * Cache invalidation hook. There is no cache layer yet, so this is a no-op;
 * services already call it after writes, so plug revalidation in here later.
 */
const invalidateCache = async () => {};

export default invalidateCache;
