import HttpException from "@/libs/http-exception";
import Notice from "@/models/Notice";
import {
  INotice,
  NoticeValidator,
  UpdateNoticeValidator,
} from "@/types/notice";
import { TypedResponse } from "@/types/response";
import { NextFunction, Request } from "express";
import { HydratedDocument } from "mongoose";

const pageSize = 10;

export const getAllNotice = async (
  req: Request,
  res: TypedResponse<{ notices: HydratedDocument<INotice>[]; total: number }>,
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
  res: TypedResponse<HydratedDocument<INotice>>,
  next: NextFunction
) => {
  const { noticeId } = req.params;
  const notice = await Notice.findById(noticeId);
  if (!notice) throw new HttpException("공지사항 정보가 없습니다", 404);

  return res.status(200).json({
    ok: true,
    msg: `공지사항-(${noticeId}) 반환`,
    status: 200,
    data: notice,
  });
};

export const createNotice = async (
  req: Request,
  res: TypedResponse<HydratedDocument<INotice>>,
  next: NextFunction
) => {
  const { title, contents, files } = NoticeValidator.parse(req.body);
  const notice = await Notice.create({ title, contents, files });

  return res.status(201).json({
    ok: true,
    msg: `공지사항-(${notice._id}) 생성`,
    status: 201,
    data: notice,
  });
};

export const updateNotice = async (
  req: Request,
  res: TypedResponse<HydratedDocument<INotice>>,
  next: NextFunction
) => {
  const { title, contents, files } = UpdateNoticeValidator.parse(req.body);
  const { noticeId } = req.params;

  const updatedNotice = await Notice.findOneAndUpdate(
    { _id: noticeId },
    {
      title,
      contents,
      files,
    }
  );
  if (!updatedNotice) throw new HttpException("공지사항 정보가 없습니다", 404);

  return res.status(201).json({
    ok: true,
    msg: `공지사항-(${noticeId}) 수정`,
    status: 201,
    data: updatedNotice,
  });
};

export const deleteOneNotice = async (
  req: Request,
  res: TypedResponse<HydratedDocument<INotice>>,
  next: NextFunction
) => {
  const { noticeId } = req.params;

  const deletedNotice = await Notice.findByIdAndDelete(noticeId);
  if (!deletedNotice) throw new HttpException("공지사항 정보가 없습니다", 404);

  return res.status(201).json({
    ok: true,
    msg: `공지사항-(${noticeId}) 삭제`,
    status: 201,
    data: deletedNotice,
  });
};
