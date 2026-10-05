class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.status = statusCode;
    }
}

module.exports = AppError;
