import HttpException from "@/libs/http-exception";
import Notice from "@/models/Notice";
import { TypedResponse } from "@/types/response";
import { NextFunction, Request } from "express";

const pageSize = 10;

export const getAllNotice = async (
  req: Request,
  res: TypedResponse<any>,
  next: NextFunction
) => {
  const { page = 1 } = req.query;
  /* @ts-ignore */
  if (isNaN(page)) throw new HttpException("올바르지 않은 쿼리입니다.", 400);
  const skipPage = (+page - 1) * pageSize;

  const total = await Notice.count({});
  const notices = await Notice.find({})
    .sort({ _id: -1 })
    .limit(pageSize)
    .skip(skipPage);

  return res.status(200).json({
    ok: true,
    msg: "공지사항 배열 반환",
    status: 200,
    data: {
      notices,
      total,
    },
  });
};

export const getOneNotice = async (
  req: Request,
  res: TypedResponse<any>,
  next: NextFunction
) => {
  const { noticeId } = req.params;
  const notice = Notice.findById(noticeId);
  if (!notice) throw new HttpException("공지사항 정보가 없습니다", 404);

  return res.status(200).json({
    ok: true,
    msg: `공지사항-(${noticeId}) 반환`,
    status: 200,
    data: notice,
  });
};

export const createNotice = async () => {};

export const updateNotice = async () => {};

export const deleteNotice = async () => {};
