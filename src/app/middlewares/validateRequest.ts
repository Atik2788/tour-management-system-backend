import { ZodObject } from "zod";
import { NextFunction, Request, Response } from "express";

export const validateRequest =
  (zodSchema: ZodObject) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body?.data) {
        try {
          req.body = JSON.parse(req.body.data);
        } catch (error) {
          return next(new Error(`Invalid JSON data, ${error}`));
        }
      }

      // req.body = JSON.parse(req.body.data) || req.body;
      req.body = await zodSchema.parseAsync(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
