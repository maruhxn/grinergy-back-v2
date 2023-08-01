import HttpException from "@/libs/http-exception";
import { TypedResponse } from "@/types/response";
import dotenv from "dotenv";
import { NextFunction, Request } from "express";
import jwt from "jsonwebtoken";

dotenv.config();

export const login = async (
  req: Request,
  res: TypedResponse<string>,
  next: NextFunction
) => {
  const { validationKey } = req.body;
  if (validationKey !== process.env.VALIDATION_KEY)
    throw new HttpException("Unauthorized", 401);

  const payload = {
    isValid: true,
  };

  const token = jwt.sign(payload, process.env.COOKIE_SECRET as string, {
    expiresIn: "3d",
    algorithm: "HS256",
  });

  return res.status(200).json({
    ok: true,
    msg: "인증 성공",
    status: 200,
    data: token,
  });
};
