// import { PrismaClient } from "@prisma/client";
import { PrismaClient } from "../../generated/prisma";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const createStudent = async (req: Request, res: Response) => {
  try {
    const { name, email, regNo, password } = req.body;

    const student = await prisma.student.create({
      data: { 
        name, 
        email, 
        regNo, 
        password 
      },
    });

    res.status(201).json(student);
 } catch (error) {
    console.error("ERROR CREATING STUDENT:", error); 
    res.status(500).json({ error: "Failed to create student", details: error });
}
};


export const getStudents = async (req: Request, res: Response) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch students", details: error });
  }
};
