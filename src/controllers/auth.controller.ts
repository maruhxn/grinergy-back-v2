import HttpException from "@/libs/http-exception";
import { TypedResponse } from "@/types/response";
import dotenv from "dotenv";
import { NextFunction, Request } from "express";

dotenv.config();

export const login = (
  req: Request,
  res: TypedResponse<void>,
  next: NextFunction
) => {
  const { validationKey } = req.body;
  if (validationKey !== process.env.VALIDATION_KEY)
    throw new HttpException("Unauthorized", 401);

  req.session.isValid = true;
  req.session.ip = req.ip;

  return res.status(200).json({
    ok: true,
    msg: "인증 성공",
    status: 200,
  });
};

export const auth = (
  req: Request,
  res: TypedResponse<void>,
  next: NextFunction
) => {
  if (!req.session?.isValid) throw new HttpException("Unauthorized", 401);

  return res.status(200).json({
    ok: true,
    msg: "인증 성공",
    status: 200,
  });
};

export const logout = (
  req: Request,
  res: TypedResponse<void>,
  next: NextFunction
) => {
  req.session.destroy((err: any) => {
    if (err) next(err);
    return res.status(201).json({
      ok: true,
      msg: "로그아웃 성공",
      status: 201,
    });
  });
};
