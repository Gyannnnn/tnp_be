"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
//File Imports
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_routes_1 = __importDefault(require("./routes/Auth/auth.routes"));
//Initialisation
const app = (0, express_1.default)();
// Middlewares
app.use((0, cors_1.default)());
app.use(express_1.default.json());
//Routes / APIs
app.get("/", (req, res) => {
    res.status(200).json({
        message: "Welcome to TNP Backend"
    });
});
app.use("/api/v1/auth", auth_routes_1.default);
//Listen
app.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running at http://localhost:${process.env.PORT || 3000}`);
});
//# sourceMappingURL=index.js.map