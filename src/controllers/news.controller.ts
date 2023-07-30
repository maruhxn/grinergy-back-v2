import HttpException from "@/libs/http-exception";
import News from "@/models/News";
import { INews, NewsValidator, UpdateNewsValidator } from "@/types/news";
import { TypedResponse } from "@/types/response";
import { NextFunction, Request } from "express";
import { HydratedDocument } from "mongoose";

const pageSize = 10;

export const getAllNews = async (
  req: Request,
  res: TypedResponse<{ news: HydratedDocument<INews>[]; total: number }>,
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
  res: TypedResponse<HydratedDocument<INews>>,
  next: NextFunction
) => {
  const { newsId } = req.params;
  const news = await News.findById(newsId);
  if (!news) throw new HttpException("뉴스 정보가 없습니다", 404);

  return res.status(200).json({
    ok: true,
    msg: `뉴스-(${newsId}) 반환`,
    status: 200,
    data: news,
  });
};

export const createNews = async (
  req: Request,
  res: TypedResponse<HydratedDocument<INews>>,
  next: NextFunction
) => {
  const { title, contents, image, url } = NewsValidator.parse(req.body);
  const news = await News.create({ title, contents, image, url });

  return res.status(201).json({
    ok: true,
    msg: `뉴스-(${news._id}) 생성`,
    status: 201,
    data: news,
  });
};

export const updateNews = async (
  req: Request,
  res: TypedResponse<HydratedDocument<INews>>,
  next: NextFunction
) => {
  const { title, contents, image, url } = UpdateNewsValidator.parse(req.body);
  const { newsId } = req.params;

  const updatedNews = await News.findOneAndUpdate(
    { _id: newsId },
    {
      title,
      contents,
      image,
      url,
    }
  );
  if (!updatedNews) throw new HttpException("뉴스 정보가 없습니다", 404);

  return res.status(201).json({
    ok: true,
    msg: `뉴스-(${newsId}) 수정`,
    status: 201,
    data: updatedNews,
  });
};

export const deleteOneNews = async (
  req: Request,
  res: TypedResponse<HydratedDocument<INews>>,
  next: NextFunction
) => {
  const { newsId } = req.params;

  const deletedNews = await News.findByIdAndDelete(newsId);
  if (!deletedNews) throw new HttpException("뉴스 정보가 없습니다", 404);

  return res.status(201).json({
    ok: true,
    msg: `뉴스-(${newsId}) 삭제`,
    status: 201,
    data: deletedNews,
  });
};
