import HttpException from "@/lib/http-exception";
import dotenv from "dotenv";
import { RequestHandler } from "express";

dotenv.config();

export const validateAdmin: RequestHandler = (req, res, next) => {
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
