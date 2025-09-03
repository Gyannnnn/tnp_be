import { Router } from "express";
//import { getPresignedUrl, addDocumentMetadata } from "../controllers/document.controller";
import { addDocumentMetadata, getPresignedUrl } from "../../controller/Document/document.controller";
import { studentAuthValidation } from "../../middlewares/auth/studentAuth.middleware";

const router = Router();

router.use(studentAuthValidation);

router.post("/presign", getPresignedUrl);
router.post("/", addDocumentMetadata);

export default router;