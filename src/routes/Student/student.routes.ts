import { Router } from "express";
import { createStudent, getStudents } from "../../controller/Student/student.controller";

const router = Router();

router.post("/", createStudent);
router.get("/", getStudents);

export default router;
