import { createExperienceSchema,updateExperienceSchema,UpdateExperienceInput } from '../../validator/experience.validator';
import { Request, Response } from 'express';
import { PrismaClient, Experience, Prisma } from '../../generated/prisma'; 


const prisma = new PrismaClient();

// ... (getMyExperiences function remains the same)
export const getMyExperiences = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    try {
        const experiences: Experience[] = await prisma.experience.findMany({
            where: { studentId },
            orderBy: { startDate: 'desc' }
        });
        return res.status(200).json({ success: true, count: experiences.length, data: experiences });
    } catch (error) {
        console.error("Error fetching experiences:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// POST a new experience
export const addExperience = async (req: Request, res: Response): Promise<Response> => {
    console.log("Request Body Received:", req.body);
    const studentId = req.user!.id;
    
    const validation = createExperienceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.flatten() });
    }

    // Destructure the validated data
    const { description, endDate, ...restOfData } = validation.data;

    try {
        const newExperience: Experience = await prisma.experience.create({
            data: {
                ...restOfData,
                // FIX 1: Explicitly convert undefined to null for optional fields
                description: description ?? null, 
                endDate: endDate ?? null,
                student: { connect: { id: studentId } },
            },
        });

        return res.status(201).json({ success: true, message: "Experience added", data: newExperience });
    } catch (error) {
        console.error("Error adding experience:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// PUT (update) an existing experience
export const updateExperience = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const { id: experienceId } = req.params;

    if (!experienceId) {
        return res.status(400).json({ success: false, message: "Experience ID is required in the URL." });
    }

    const validation = updateExperienceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.error.flatten() });
    }

    try {
        const existingExperience = await prisma.experience.findUnique({ where: { id: experienceId } });
        if (!existingExperience) {
            return res.status(404).json({ success: false, message: "Experience not found" });
        }
        if (existingExperience.studentId !== studentId) {
            return res.status(403).json({ success: false, message: "User not authorized" });
        }
        
        // FIX: Manually build the payload to guarantee no 'undefined' fields are passed to Prisma.
        // This satisfies TypeScript's strict checking.
        const dataForUpdate: Prisma.ExperienceUpdateInput = {};
        const validatedData = validation.data;

        if (validatedData.title !== undefined) dataForUpdate.title = validatedData.title;
        if (validatedData.type !== undefined) dataForUpdate.type = validatedData.type;
        if (validatedData.organisation !== undefined) dataForUpdate.organisation = validatedData.organisation;
        if (validatedData.description !== undefined) dataForUpdate.description = validatedData.description;
        if (validatedData.startDate !== undefined) dataForUpdate.startDate = validatedData.startDate;
        if (validatedData.endDate !== undefined) dataForUpdate.endDate = validatedData.endDate;
        if (validatedData.technologies !== undefined) dataForUpdate.technologies = validatedData.technologies;


        const updatedExperience: Experience = await prisma.experience.update({
            where: { id: experienceId },
            data: dataForUpdate,
        });

        return res.status(200).json({ success: true, message: "Experience updated", data: updatedExperience });
    } catch (error) {
        console.error("Error updating experience:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

// ... (deleteExperience function remains the same)
export const deleteExperience = async (req: Request, res: Response): Promise<Response> => {
    const studentId = req.user!.id;
    const { id: experienceId } = req.params;
    if (!experienceId) {
        return res.status(400).json({ success: false, message: "Experience ID is required in the URL." });
    }
    try {
        const existingExperience = await prisma.experience.findUnique({ where: { id: experienceId } });
        if (!existingExperience) {
            return res.status(404).json({ success: false, message: "Experience not found" });
        }
        if (existingExperience.studentId !== studentId) {
            return res.status(403).json({ success: false, message: "User not authorized" });
        }
        await prisma.experience.delete({ where: { id: experienceId } });
        return res.status(200).json({ success: true, message: "Experience deleted" });
    } catch (error) {
        console.error("Error deleting experience:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};