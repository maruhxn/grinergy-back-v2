import logger from "@/configs/logger";
import HttpException from "@/libs/http-exception";
import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";
import { z } from "zod";

const ErrorFilter = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { stack, status = 500, message = "Server Error" } = err;
  logger.error(stack);
  if (err instanceof HttpException) {
    return res.status(status).json({
      ok: false,
      status,
      message,
    });
  } else if (err instanceof MulterError) {
    return res.status(400).json({
      ok: false,
      status: 400,
      message: "파일 용량이 너무 큽니다",
    });
  } else if (err instanceof z.ZodError) {
    return res.status(422).json({
      ok: false,
      status: 422,
      message: err.message,
    });
  } else {
    return res.status(422).json({
      ok: false,
      status: 422,
      message: "잘못된 접근입니다.",
    });
  }
};

export default ErrorFilter;
