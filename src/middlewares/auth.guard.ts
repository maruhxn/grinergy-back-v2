import HttpException from "@/libs/http-exception";
import { extractTokenFromRequest } from "@/libs/util";
import dotenv from "dotenv";
import { NextFunction, Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";

dotenv.config();

export const isLoggedIn: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractTokenFromRequest(req);
  if (!token) return next(new HttpException("로그인이 필요합니다.", 401));

  try {
    const decodedToken = jwt.verify(token, process.env.COOKIE_SECRET as string);
    if ((decodedToken as any).isValid) {
      req.isValid = true;
      return next();
    } else {
      return next(new HttpException("로그인이 필요합니다.", 401));
    }
  } catch (err) {
    return next(new HttpException("유효하지 않은 토큰입니다.", 403));
  }
};

export const isNotLoggedIn: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractTokenFromRequest(req);

  if (!token) return next();

  try {
    const decodedToken = jwt.verify(
      token!,
      process.env.COOKIE_SECRET as string
    );

    if (!(decodedToken as any).isValid) {
      return next();
    } else {
      req.isValid = true;
      return next(new HttpException("이미 로그인 되어 있습니다.", 403));
    }
  } catch (err) {
    return next();
  }
};
