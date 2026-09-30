
const store = global._kvStore || (global._kvStore = new Map());

const alive = (key) => {
    const entry = store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
        store.delete(key);
        return null;
    }
    return entry;
};

const client = {
    async get(key) {
        return alive(key)?.value ?? null;
    },
    async set(key, value, options = {}) {
        const ttl = options.EX ?? options.ex;
        store.set(key, {
            value: String(value),
            expiresAt: ttl ? Date.now() + ttl * 1000 : null,
        });
        return "OK";
    },
    async del(key) {
        return store.delete(key) ? 1 : 0;
    },
    async exists(key) {
        return alive(key) ? 1 : 0;
    },
    async incr(key) {
        const entry = alive(key);
        const next = (entry ? Number(entry.value) : 0) + 1;
        store.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
        return next;
    },
    async expire(key, seconds) {
        const entry = alive(key);
        if (!entry) return 0;
        entry.expiresAt = Date.now() + seconds * 1000;
        return 1;
    },
    async ttl(key) {
        const entry = alive(key);
        if (!entry) return -2;
        if (!entry.expiresAt) return -1;
        return Math.max(Math.ceil((entry.expiresAt - Date.now()) / 1000), 0);
    },
};

module.exports = client;
