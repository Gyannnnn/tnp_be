import { Router } from "express";
import { addExperience,getMyExperiences,updateExperience,deleteExperience } from "../../controller/Experience/experience.controller";
import { studentAuthValidation } from "../../middlewares/auth/studentAuth.middleware";

const router=Router();

router.use(studentAuthValidation);

// Group routes for endpoints that don't require an ID
router.route("/")
  .post(addExperience)       
  .get(getMyExperiences);    

// Group routes for endpoints that require an ID ('/api/experience/:id')
router.route("/:id")
  .put(updateExperience)     
  .delete(deleteExperience); 

export default router;