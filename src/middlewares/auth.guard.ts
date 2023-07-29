import HttpException from "@/libs/http-exception";
import { RequestHandler } from "express";

export const isLoggedIn: RequestHandler = (req, res, next) => {
  if (req.session.isValid) {
    next();
  } else {
    next(new HttpException("로그인 필요", 401));
  }
};

export const isNotLoggedIn: RequestHandler = (req, res, next) => {
  if (!req.session.isValid) {
    next();
  } else {
    next(new HttpException("이미 로그인 되어 있습니다.", 403));
  }
};
