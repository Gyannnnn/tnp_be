import { Router } from "express";
import { DocumentController } from "../../controller/Document/document.controller"; 

const router = Router();

// CRUD routes for Document
router.post("/", DocumentController.create);      // Create Document
router.get("/", DocumentController.getAll);       // Get All Documents
router.get("/:id", DocumentController.getById);   // Get Document by ID
router.put("/:id", DocumentController.update);    // Update Document
router.delete("/:id", DocumentController.delete); // Delete Document

export default router;
