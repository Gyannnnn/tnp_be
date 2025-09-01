import { Request, Response } from "express";
import z from "zod";
import { PrismaClient } from "../../generated/prisma";
const prisma = new PrismaClient();
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const adminSignUp = async (request: Request, response: Response) => {
  try {
    const schema = z.object({
      name: z.string().min(10).max(60),
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
          message:
            "Password must include uppercase, lowercase, number, and special character",
        })
        .max(16),      
    });
    const results = schema.safeParse(request.body);
    if (!results.success) {
      response.status(400).json({
        message: results.error,
      });
      return;
    }
    const { name, email, password } = results.data;
    const hashedAdminPassword = bcrypt.hashSync(password, 10);
    const existingAdmin = await prisma.admin.findFirst({
      where:{
        email
      }
    })
    if (existingAdmin) {
      response.status(409).json({
        message: "User already exists",
      });
      return;
    }

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email,
        password: hashedAdminPassword
      },
    });
    if (!newAdmin) {
      response.status(500).json({
        message: "Failed to create new Admin",
      });
    }
   const token = jwt.sign(
      {id:newAdmin.id, name, email, role:"ADMIN" },
      process.env.JWT_SECRET!,
      {
        expiresIn: "30days",
      }
    );    
    response.status(200).json({
      message: "New Admin Created successfully",
      newAdmin: newAdmin,
      token: token,
    });
  } catch (error) {    
    response.status(500).json({
      messsage: "Internal Server Error",
      error: error,
    });
  }
};

export const adminSignIn = async (request: Request, response: Response) => {
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

    const existAdmin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!existAdmin) {
      response.status(404).json({
        message: "Admin not found",
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existAdmin.password
    );

    if (!isPasswordValid) {
      response.status(401).json({
        message: "Invalid password",
      });
      return;
    }

    const token = jwt.sign(
      {id:existAdmin.id, name, email, role:"ADMIN" },
      process.env.JWT_SECRET!,
      {
        expiresIn: "30days",
      }
    );  
   
    return response.status(200).json({
      message: "Admin Sign in successful",
      token,
      user: {
        id: existAdmin.id,
        userEmail: existAdmin.email,
        userName: existAdmin.name        
      },
    });
  } catch (error) {    
    return response.status(500).json({
      message: "Internal Server Error",
      error: error
    });
  }
};

export const updateAdminPassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword, id } = req.body;
  
  if (
    !currentPassword?.trim() ||
    !newPassword?.trim() ||
    !id.trim()
  ) {
    res.status(401).json({
      message: "All fields are required",
    });
    return;
  }
  try {
    const admin = await prisma.admin.findUnique({
      where: {
        id
      },
    });
    if (!admin) {
      res.status(401).json({
        message: "No Admin found",
      });
      return;
    }
    const isMatch =  bcrypt.compareSync(
      currentPassword,
      admin.password
    );
    if (!isMatch) {
      res.status(401).json({
        message: "Invalid password",
      });
      return;
    }
    const hashedPassword = bcrypt.hashSync(
      newPassword,
      10
    );
    const response = await prisma.admin.update({
      where: {
        id
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
      message: "Successfully updated admin password"
    })
  } catch (error) {    
    res.status(500).json({
      message: "Internal srever error",
      error: error
    });
  }
};
