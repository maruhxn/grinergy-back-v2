import HttpException from "@/libs/http-exception";
import logger from "@/logger";
import { NextFunction, Request, Response } from "express";
import { MulterError } from "multer";

const ErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { stack, statusCode = 500, message = "Server Error" } = err;
  logger.error(stack);
  if (err instanceof HttpException) {
    return res.status(statusCode).json({
      ok: false,
      statusCode,
      message,
    });
  } else if (err instanceof MulterError) {
    return res.status(400).json({
      ok: false,
      statusCode: 400,
      message: "파일 용량이 너무 큽니다",
    });
  } else {
    return res.status(422).json({
      ok: false,
      statusCode: 422,
      message: "잘못된 접근입니다.",
    });
  }
};

export default ErrorHandler;
