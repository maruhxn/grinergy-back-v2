import HttpException from "@/libs/http-exception";
import News from "@/models/News";
import { TypedResponse } from "@/types/response";
import { NextFunction, Request } from "express";

const pageSize = 10;

export const getAllNews = async (
  req: Request,
  res: TypedResponse<any>,
  next: NextFunction
) => {
  const { page = 1 } = req.query;
  /* @ts-ignore */
  if (isNaN(page)) throw new HttpException("올바르지 않은 쿼리입니다.", 400);
  const skipPage = (+page - 1) * pageSize;

  const total = await News.count({});
  const news = await News.find({})
    .sort({ _id: -1 })
    .limit(pageSize)
    .skip(skipPage);

  return res.status(200).json({
    ok: true,
    msg: "뉴스 배열 반환",
    status: 200,
    data: {
      news,
      total,
    },
  });
};

export const getOneNews = async (
  req: Request,
  res: TypedResponse<any>,
  next: NextFunction
) => {
  const { newsId } = req.params;
  const news = News.findById(newsId);
  if (!news) throw new HttpException("뉴스 정보가 없습니다", 404);

  return res.status(200).json({
    ok: true,
    msg: `뉴스-(${newsId}) 반환`,
    status: 200,
    data: news,
  });
};

export const createNews = async () => {};

export const updateNews = async () => {};

export const deleteNews = async () => {};
