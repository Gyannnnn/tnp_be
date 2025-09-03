import { Request, Response, NextFunction } from "express";

/**
 * Wraps an async route handler and forwards any errors to Express's error middleware.
 */

export const asyncHandler =
  <TReq = Request>(
    fn: (req: TReq, res: Response, next: NextFunction) => Promise<any>
  ) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req as TReq, res, next)).catch(next);