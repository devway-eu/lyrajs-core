import { NotFoundException } from "../../errors/index.js";
import { RouterHelper } from "../../security/index.js";
export const httpRequestMiddleware = (req, res, next) => {
    const routerRoutes = RouterHelper.listRoutes();
    const routerProvidesReqRoute = routerRoutes.find((route) => route.path === req.originalUrl && route.httpMethod === req.method);
    if (!routerProvidesReqRoute)
        throw new NotFoundException("Route");
    next();
};
//# sourceMappingURL=httpRequestMiddleware.js.map