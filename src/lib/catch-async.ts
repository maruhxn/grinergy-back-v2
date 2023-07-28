import { NextFunction, Request, Response } from "express";

const catchAsync = (
  func: (req: Request, res: Response, next: NextFunction) => any
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default catchAsync;
