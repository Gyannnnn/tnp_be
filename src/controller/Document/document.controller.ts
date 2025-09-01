import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const DocumentController = {
  // Create Document
  async create(req: Request, res: Response) {
    try {
      const { title, fileUrl, type, fileName, fileSize, mimeType, studentId } = req.body;

      if (!title || !fileUrl || !studentId) {
        return res.status(400).json({ error: "title, fileUrl and studentId are required" });
      }

      const document = await prisma.document.create({
        data: {
          title,
          fileUrl,
          type,
          fileName,
          fileSize,
          mimeType,
          studentId,
        },
      });

      res.status(201).json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  //Get all Documents
  async getAll(req: Request, res: Response) {
    try {
      const documents = await prisma.document.findMany({
        include: { student: true }, // 👈 include student details if needed
      });
      res.json(documents);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get Document by ID
  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const document = await prisma.document.findUnique({
        where: { id },
        include: { student: true },
      });

      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      res.json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update Document
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { title, fileUrl, type, fileName, fileSize, mimeType, isVerified } = req.body;

      const document = await prisma.document.update({
        where: { id },
        data: {
          title,
          fileUrl,
          type,
          fileName,
          fileSize,
          mimeType,
          isVerified,
        },
      });

      res.json(document);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete Document
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      await prisma.document.delete({
        where: { id },
      });

      res.json({ message: "Document deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};
