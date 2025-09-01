import { Request, Response } from "express";
import z from "zod";
import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

enum Branches {}

const branchEnum = z.enum([
  "CSE",
  "IT",
  "CSE_AIML",
  "PE",
  "ETC",
  "ME",
  "CE",
  "EE",
]);

export const studentSignUp = async (request: Request, response: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(10).max(60),
      email: z.string().email(),
      regNo: z.string().length(10),
      password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        })
        .max(16),
      profileImg: z.string().url().optional(),
      branch: branchEnum,
      graduationYear: z.number().min(2020).max(2035),
      cgpa: z.number().min(0).max(10),
    });
    const results = schema.safeParse(request.body);
    if (!results.success) {
      response.status(400).json({
        message: results.error,
      });
      return;
    }
    const {
      name,
      email,
      password,
      regNo,
      profileImg,
      branch,
      graduationYear,
      cgpa,
    } = results.data;
    const hashedStudentPassword = bcrypt.hashSync(password, 10);
    const existingStudent = await prisma.student.findFirst({
      where: {
        email,
      },
    });
    if (existingStudent) {
      response.status(409).json({
        message: "Student already exists",
      });
      return;
    }

    const newStudent = await prisma.student.create({
      data: {
        name,
        email,
        password: hashedStudentPassword,
        regNo,
        profileImg: typeof profileImg === "string" ? profileImg : null,
        branch,
        graduationYear,
        cgpa,
      },
    });
    if (!newStudent) {
      response.status(500).json({
        message: "Failed to create new Student",
      });
    }
    const token = jwt.sign(
      {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        role: "STUDENT",
      },
      process.env.JWT_SECRET!,
      { expiresIn: "30d" }
    );

    response.status(201).json({
      message: "New Student Created successfully",
      student: {
        id: newStudent.id,
        name: newStudent.name,
        email: newStudent.email,
        regNo: newStudent.regNo,
        branch: newStudent.branch,
        graduationYear: newStudent.graduationYear,
        cgpa: newStudent.cgpa,
        profileImg: newStudent.profileImg,
      },
      token: token,
    });
  } catch (error) {
    response.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const studentSignIn = async (request: Request, response: Response) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        })
        .max(47),
    });

    const result = schema.safeParse(request.body);
    if (!result.success) {
      response.status(400).json({
        message: "Validation failed",
        errors: result.error,
      });
      return;
    }

    const { email, password } = result.data;

    const existingStudent = await prisma.student.findUnique({
      where: { email },
    });

    if (!existingStudent) {
      response.status(404).json({
        message: "Student not found",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingStudent.password
    );

    if (!isPasswordValid) {
      response.status(401).json({
        message: "Invalid password",
      });
      return;
    }

    const token = jwt.sign(
      {
        id: existingStudent.id,
        name: existingStudent.name,
        email: existingStudent.email,
        role: "STUDENT",
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "30d",
      }
    );

    return response.status(200).json({
      message: "Student Sign in successful",
      token,
      user: {
        id: existingStudent.id,
        name: existingStudent.name,
        email: existingStudent.email,
        regNo: existingStudent.regNo,
        branch: existingStudent.branch,
        graduationYear: existingStudent.graduationYear,
        cgpa: existingStudent.cgpa,
        profileImg: existingStudent.profileImg,
      },
    });
  } catch (error) {
    return response.status(500).json({
      message: "Internal Server Error",
      error: error,
    });
  }
};

export const updateStudentPassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, id } = req.body;

  if (!currentPassword?.trim() || !newPassword?.trim() || !id.trim()) {
    res.status(401).json({
      message: "All fields are required",
    });
    return;
  }
  try {
    const student = await prisma.student.findUnique({
      where: {
        id,
      },
    });
    if (!student) {
      res.status(401).json({
        message: "No Student found",
      });
      return;
    }
    const isMatch = bcrypt.compareSync(currentPassword, student.password);
    if (!isMatch) {
      res.status(401).json({
        message: "Invalid password",
      });
      return;
    }
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    const response = await prisma.student.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });
    if (!response) {
      res.status(400).json({
        message: "Failed to update password",
      });
    }
    res.status(200).json({
      message: "Successfully updated student password",
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal srever error",
      error: error,
    });
  }
};
