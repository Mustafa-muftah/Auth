import jwt from "jsonwebtoken";
import { NextFunction, Request, Response } from "express";

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["token"] as string;
  const token =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;

  if (!token) {
    return res
      .status(401)
      .json({ auth: false, error: "Access token is required." });
  }
  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (jwtSecret) {
      const decoded = jwt.verify(token, jwtSecret) as {
        id: string;
        name: string;
        email: string;
      };
      console.log("Decoded JWT:", req.body.email === decoded.email);
      if (decoded.email !== req.body.email) {
        res
          .status(403)
          .json({
            auth: false,
            error: "You are not authorized to access this resource.",
          });
        return;
      }
      next();
    }
  } catch (error: unknown) {
    const err = error as Error;
    res.json({
      auth: false,
      data: err.message || "Invalid token",
    });
  }
};
