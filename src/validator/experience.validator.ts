import { z } from 'zod';
import { ExpType } from '../generated/prisma'; 


const expTypeEnum = z.nativeEnum(ExpType);


export const createExperienceSchema = z.object({
  type: expTypeEnum,
  title: z.string().min(3, "Title must be at least 3 characters long"),
  organisation: z.string().min(2, "Organisation is required"),
  description: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  technologies: z.array(z.string()).optional().default([]),
}).refine(data => {
  if (data.endDate) {
    return data.endDate > data.startDate;
  }
  return true;
}, {
  message: "End date must be after the start date",
  path: ["endDate"],
});


export const updateExperienceSchema = createExperienceSchema.partial();

export type CreateExperienceInput = z.infer<typeof createExperienceSchema>;
export type UpdateExperienceInput = z.infer<typeof updateExperienceSchema>;