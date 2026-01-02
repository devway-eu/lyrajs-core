import { Config } from "../../config/index.js";
import { LyraConsole } from "../../console/LyraConsole.js";
const isProduction = () => {
    const apiEnv = new Config().getParam("api_env");
    return apiEnv === "prod" || apiEnv === "production";
};
const getErrorMessage = (error) => {
    if (isProduction() && error.status === 500) {
        return "Internal Server Error";
    }
    return error.message || "An error occurred";
};
const logError = (error, req) => {
    const timestamp = new Date().toISOString();
    const method = req.method;
    const path = req.url || "unknown";
    const userAgent = req.headers["user-agent"] || "unknown";
    const ip = req.socket.remoteAddress || "unknown";
    LyraConsole.error("ERROR", `[${timestamp}] ${method} ${path} - ${error.status} - ${error.message}`, `User-Agent: ${userAgent}`, `IP: ${ip}`);
    if (!isProduction() && error.stack) {
        LyraConsole.error("ERROR", `Stack: ${error.stack}`);
    }
};
export const errorHandler = (error, req, res, _next) => {
    const httpError = error;
    const status = httpError.status || 500;
    logError(httpError, req);
    const errorResponse = {
        status,
        message: getErrorMessage(httpError),
        path: req.url || "unknown",
        timestamp: new Date().toISOString()
    };
    const requestId = req.headers["x-request-id"];
    if (requestId) {
        errorResponse.requestId = requestId;
    }
    res.status(status).json(errorResponse);
};
//# sourceMappingURL=errorHandler.js.map