import HttpException from "@/libs/http-exception";
import { extractTokenFromRequest } from "@/libs/util";
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

// 로그인 페이지: 토큰이 없거나, isValid가 false, 혹은 토큰이 유효하지 않으면 OK
// 그 외 어드민 페이지: 토큰이 있고, isValid여야 OK

export const auth = (
  req: Request,
  res: TypedResponse<void>,
  next: NextFunction
) => {
  const token = extractTokenFromRequest(req);
  if (!token)
    return res.status(200).json({
      ok: false,
      msg: "로그인 되어있지 않음.",
      status: 200,
    });

  try {
    const decodedToken = jwt.verify(token, process.env.COOKIE_SECRET as string);
    if ((decodedToken as any).isValid) {
      req.isValid = true;
      return res.status(200).json({
        ok: true,
        msg: "로그인 되어있음.",
        status: 200,
      });
    } else {
      return res.status(200).json({
        ok: false,
        msg: "로그인 되어있지 않음.",
        status: 200,
      });
    }
  } catch (err) {
    return res.status(200).json({
      ok: false,
      msg: "로그인 되어있지 않음.",
      status: 200,
    });
  }
};
