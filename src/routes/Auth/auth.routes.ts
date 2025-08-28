import { Router } from "express";
const authRouter = Router();


import { signUp } from "../../controller/Auth/auth.controller";



authRouter.get("/signup",signUp)




export default authRouter;