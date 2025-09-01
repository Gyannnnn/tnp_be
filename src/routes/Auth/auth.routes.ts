import { Router } from "express";
const authRouter = Router();

//Middleware imports
import { adminAuthValidation } from "../../middlewares/auth/adminAuth.middleware";
import { studentAuthValidation } from "../../middlewares/auth/studentAuth.middleware";


//Controller imports
import { adminSignIn, adminSignUp, updateAdminPassword } from "../../controller/Auth/adminAuth.controller";
import { studentSignIn, studentSignUp, updateStudentPassword } from "../../controller/Auth/studentAuth.controller";



//Admin Auth Routes
authRouter.post("/admin/signup",adminSignUp);
authRouter.post("/admin/signin",adminSignIn);
authRouter.put("/admin/update-password",adminAuthValidation,updateAdminPassword);


//Student Auth Routes
authRouter.post("/student/signup",studentSignUp);
authRouter.post("/student/signin",studentSignIn);
authRouter.put("/student/update-password",studentAuthValidation,updateStudentPassword)



export default authRouter;