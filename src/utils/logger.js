const fmt = (level, args) => [`[${new Date().toISOString()}] [${level}]`, ...args];

const logger = {
    info: (...args) => console.log(...fmt("info", args)),
    warn: (...args) => console.warn(...fmt("warn", args)),
    error: (...args) => console.error(...fmt("error", args)),
    debug: (...args) => {
        if (process.env.NODE_ENV !== "production") console.debug(...fmt("debug", args));
    },
};

module.exports = logger;
