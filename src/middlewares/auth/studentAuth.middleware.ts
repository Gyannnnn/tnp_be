import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const studentAuthValidation = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      message: "Unauthorised access",
    });
    return;
  }
  const token = authHeader.split(" ")[1] as string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = decoded;
    const role = decoded.role as string;

    if (role === "STUDENT" || role === "ADMIN") {
      next();
    } else {
      res.status(403).json({
        message: "Access denied",
      });
    }
  } catch (error) {
    res.status(403).json({
      message: "Invalid or expired token",
    });
  }
};
