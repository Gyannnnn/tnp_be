"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRouter = (0, express_1.Router)();
const auth_controller_1 = require("../../controller/Auth/auth.controller");
authRouter.get("/signup", auth_controller_1.signUp);
exports.default = authRouter;
//# sourceMappingURL=auth.routes.js.map