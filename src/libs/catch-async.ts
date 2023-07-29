import { NextFunction, Request } from "express";

const catchAsync = (
  func: (req: Request, res: any, next: NextFunction) => any
) => {
  return async (req: Request, res: any, next: NextFunction) => {
    try {
      await func(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default catchAsync;
