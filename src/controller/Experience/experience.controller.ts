import {
  createExperienceSchema,
  updateExperienceSchema,
} from "../../validator/experience.validator";
import { Request, Response } from "express";
import { PrismaClient, Experience, Prisma } from "../../generated/prisma";
import { asyncHandler } from "../../utils/Handlers/asyncHandler";
import ApiResponse from "../../utils/Handlers/apiResponse";
import ApiError from "../../utils/Handlers/apiError";

const prisma = new PrismaClient();

//getting Experience

export const getMyExperiences = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = req.user!.id;

    const experiences: Experience[] = await prisma.experience.findMany({
      where: { studentId },
      orderBy: { startDate: "desc" }, // Order by most recent first
    });

    const response = ApiResponse.success(experiences, {
      count: experiences.length,
    });

    return res.status(response.statusCode).json(response.body);
  }
);

// POSTing a new experience

export const addExperience = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = req.user!.id;

    const validation = createExperienceSchema.safeParse(req.body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      throw new ApiError(
        "validation",
        "Input validation failed",
        fieldErrors,
        422
      );
    }

    const { description, endDate, ...restOfData } = validation.data;

    const newExperience: Experience = await prisma.experience.create({
      data: {
        ...restOfData,
        description: description ?? null,
        endDate: endDate ?? null,
        student: { connect: { id: studentId } },
      },
    });

    const response = ApiResponse.success(
      newExperience,
      { message: "Experience added successfully" },
      201
    );

    return res.status(response.statusCode).json(response.body);
  }
);

//Updating an existing experience

export const updateExperience = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const { id: experienceId } = req.params;

    if (!experienceId) {
      throw ApiError.badRequest(
        "Experience ID is required in the URL parameters."
      );
    }

    const validation = updateExperienceSchema.safeParse(req.body);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      throw new ApiError(
        "validation",
        "Input validation failed",
        fieldErrors,
        422
      );
    }

    const existingExperience = await prisma.experience.findUnique({
      where: { id: experienceId },
    });

    if (!existingExperience) {
      throw ApiError.notFound("Experience not found with the provided ID.");
    }

    if (existingExperience.studentId !== studentId) {
      throw ApiError.forbidden(
        "You are not authorized to update this experience."
      );
    }

    const dataForUpdate: Prisma.ExperienceUpdateInput = {};
    const validatedData = validation.data;

    if (validatedData.title !== undefined)
      dataForUpdate.title = validatedData.title;
    if (validatedData.type !== undefined)
      dataForUpdate.type = validatedData.type;
    if (validatedData.organisation !== undefined)
      dataForUpdate.organisation = validatedData.organisation;
    if (validatedData.description !== undefined)
      dataForUpdate.description = validatedData.description;
    if (validatedData.startDate !== undefined)
      dataForUpdate.startDate = validatedData.startDate;
    if (validatedData.endDate !== undefined)
      dataForUpdate.endDate = validatedData.endDate;
    if (validatedData.technologies !== undefined)
      dataForUpdate.technologies = validatedData.technologies;

    const updatedExperience: Experience = await prisma.experience.update({
      where: { id: experienceId },
      data: dataForUpdate,
    });

    const response = ApiResponse.success(updatedExperience, {
      message: "Experience updated successfully",
    });

    return res.status(response.statusCode).json(response.body);
  }
);

//Delete Exp

export const deleteExperience = asyncHandler(
  async (req: Request, res: Response) => {
    const studentId = req.user!.id;
    const { id: experienceId } = req.params;

    if (!experienceId) {
      throw ApiError.badRequest(
        "Experience ID is required in the URL parameters."
      );
    }

    const existingExperience = await prisma.experience.findUnique({
      where: { id: experienceId },
    });

    if (!existingExperience) {
      throw ApiError.notFound("Experience not found with the provided ID.");
    }

    if (existingExperience.studentId !== studentId) {
      throw ApiError.forbidden(
        "You are not authorized to delete this experience."
      );
    }

    await prisma.experience.delete({
      where: { id: experienceId },
    });

    const response = ApiResponse.success(
      {},
      { message: "Experience deleted successfully" }
    );

    return res.status(response.statusCode).json(response.body);
  }
);
