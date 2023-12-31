import CONFIGS from "@/configs/config";
import HttpException from "@/libs/http-exception";
import { deleteS3File, extractOneFile } from "@/libs/util";
import News from "@/models/News";
import { File, FileValidator } from "@/types/file";
import { CreateNewsValidator, INews, UpdateNewsValidator } from "@/types/news";
import { TypedResponse } from "@/types/response";
import { NextFunction, Request } from "express";
import { HydratedDocument } from "mongoose";

export const getAllNews = async (
  req: Request,
  res: TypedResponse<{ news: HydratedDocument<INews>[]; total: number }>,
  next: NextFunction
) => {
  const { page = 1 } = req.query;
  /* @ts-ignore */
  if (isNaN(page)) throw new HttpException("올바르지 않은 쿼리입니다.", 400);
  const skipPage = (+page - 1) * CONFIGS.NEWS_PAGESIZE;

  const total = await News.count({});
  const news = await News.find({})
    .sort({ _id: -1 })
    .limit(CONFIGS.NEWS_PAGESIZE)
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
  const { title, contents, url } = CreateNewsValidator.parse(req.body);
  let news: HydratedDocument<INews>;

  if (!req.file) throw new HttpException("이미지를 업로드 해주세요.", 400);

  const file = extractOneFile(req.file as Express.MulterS3.File);
  const image = FileValidator.parse(file);
  news = await News.create({ title, contents, image, url });

  return res.status(201).json({
    ok: true,
    msg: `뉴스-(${news._id}) 생성`,
    status: 201,
    data: news,
  });
};

export const updateNews = async (
  req: Request,
  res: TypedResponse<void>,
  next: NextFunction
) => {
  const { title, contents, url } = UpdateNewsValidator.parse(req.body);
  const { newsId } = req.params;
  const updateObject: {
    title?: string;
    contents?: string;
    url?: string;
    image?: File;
  } = { title, contents, url };

  if (req.file) {
    const file = extractOneFile(req.file as Express.MulterS3.File);
    const image = FileValidator.parse(file);
    updateObject.image = image;
  }

  const oldNews = await News.findByIdAndUpdate(newsId, updateObject);

  if (!oldNews) throw new HttpException("뉴스 정보가 없습니다", 404);

  if (updateObject.image) deleteS3File(oldNews.image.filePath);

  return res.status(201).json({
    ok: true,
    msg: `뉴스-(${newsId}) 수정`,
    status: 201,
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

  /* File Deleting */
  deleteS3File(deletedNews.image.filePath);

  return res.status(201).json({
    ok: true,
    msg: `뉴스-(${newsId}) 삭제`,
    status: 201,
    data: deletedNews,
  });
};

export const getNewsStartWithQuery = async (
  req: Request,
  res: TypedResponse<{
    news: HydratedDocument<INews>[];
    total: number;
  }>,
  next: NextFunction
) => {
  const { q, page = 1 } = req.query;
  /* @ts-ignore */
  if (isNaN(page)) throw new HttpException("올바르지 않은 쿼리입니다.", 400);
  if (!q) throw new HttpException("검색어를 입력해주세요", 400);
  const skipPage = (+page - 1) * CONFIGS.NEWS_PAGESIZE;
  const regex = new RegExp(`^${q}`, "i");

  const searchQuery = {
    title: {
      $regex: regex,
    },
  };

  const total = await News.countDocuments(searchQuery);
  const searchedNews = await News.find(searchQuery)
    .sort({ _id: -1 })
    .limit(CONFIGS.NEWS_PAGESIZE)
    .skip(skipPage);

  return res.status(200).json({
    ok: true,
    msg: "검색 결과",
    status: 200,
    data: {
      news: searchedNews,
      total,
    },
  });
};
