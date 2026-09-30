/** Error carrying an HTTP status: `throw new AppError(400, "message")`. */
class AppError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.status = statusCode;
    }
}

module.exports = AppError;
