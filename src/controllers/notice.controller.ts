import CONFIGS from "@/configs/config";
import HttpException from "@/libs/http-exception";
import { deleteS3File, extractFiles } from "@/libs/util";
import Notice from "@/models/Notice";
import { File } from "@/types/file";
import {
  CreateNoticeValidator,
  INotice,
  UpdateNoticeValidator,
} from "@/types/notice";
import { TypedResponse } from "@/types/response";
import { NextFunction, Request } from "express";
import { HydratedDocument } from "mongoose";

export const getAllNotice = async (
  req: Request,
  res: TypedResponse<{ notices: HydratedDocument<INotice>[]; total: number }>,
  next: NextFunction
) => {
  const { page = 1 } = req.query;
  /* @ts-ignore */
  if (isNaN(page)) throw new HttpException("올바르지 않은 쿼리입니다.", 400);
  const skipPage = (+page - 1) * CONFIGS.NOTICE_PAGESIZE;

  const total = await Notice.countDocuments({});
  const notices = await Notice.find({})
    .sort({ _id: -1 })
    .limit(CONFIGS.NOTICE_PAGESIZE)
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
  const { title, contents } = CreateNoticeValidator.parse(req.body);
  let notice: HydratedDocument<INotice>;

  if (req.files) {
    const files = extractFiles(req.files as Express.MulterS3.File[]);
    notice = await Notice.create({ title, contents, files });
  } else {
    notice = await Notice.create({ title, contents });
  }

  return res.status(201).json({
    ok: true,
    msg: `공지사항-(${notice._id}) 생성`,
    status: 201,
    data: notice,
  });
};

/**
 * 기존 방식
 * 1. 일단 title, contents만 먼저 update
 * 2. files가 있다면 추가로 save
 * 3. deletedFiles가 있다면 다시 update
 * 이렇게 총 3번의 절차에 걸쳐 수행하다보니 오버헤드가 컸음.
 *
 * 개선 방식
 * 1. deletedFiles 있다면 $pull을 통해 먼저 삭제 후 update -> 비동기로 파일 삭제까지 먼저 진행
 * 2. 이후 req.files가 있다면 정제 후 files 배열에 넣어줌.
 * 3. files가 빈 배열인지 아닌지 상관없이 $pull 연산자를 통해 한번에 업데이트 가능.
 * 2번의 DB 접근으로 줄이고, 코드 가독성이 좋아짐.
 */
export const updateNotice = async (
  req: Request,
  res: TypedResponse<HydratedDocument<INotice>>,
  next: NextFunction
) => {
  const { title, contents, deletedFiles } = UpdateNoticeValidator.parse(
    req.body
  );

  const { noticeId } = req.params;
  const files: File[] = req.files
    ? extractFiles(req.files as Express.MulterS3.File[])
    : [];

  if (deletedFiles) {
    await Notice.findByIdAndUpdate(
      noticeId,
      {
        $pull: {
          files: {
            filePath: { $in: deletedFiles },
          },
        },
      },
      { new: true }
    );

    if (!Array.isArray(deletedFiles)) {
      deleteS3File(deletedFiles);
    } else {
      deletedFiles.forEach(async (deletedFilePath) => {
        deleteS3File(deletedFilePath);
      });
    }
  }

  const updatedNotice = await Notice.findByIdAndUpdate(
    noticeId,
    {
      title,
      contents,
      $push: {
        files: files,
      },
    },
    { new: true }
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

  /* File Deleting */
  deletedNotice?.files?.forEach(async (deletedFile) =>
    deleteS3File(deletedFile.filePath)
  );

  return res.status(201).json({
    ok: true,
    msg: `공지사항-(${noticeId}) 삭제`,
    status: 201,
    data: deletedNotice,
  });
};

export const getNoticeStartWithQuery = async (
  req: Request,
  res: TypedResponse<{
    notices: HydratedDocument<INotice>[];
    total: number;
  }>,
  next: NextFunction
) => {
  const { q, page = 1 } = req.query;
  /* @ts-ignore */
  if (isNaN(page)) throw new HttpException("올바르지 않은 쿼리입니다.", 400);
  if (!q) throw new HttpException("검색어를 입력해주세요", 400);
  const skipPage = (+page - 1) * CONFIGS.NOTICE_PAGESIZE;
  const regex = new RegExp(`^${q}`, "i");

  const searchQuery = {
    title: {
      $regex: regex,
    },
  };

  const total = await Notice.countDocuments(searchQuery);
  const searchedNotices = await Notice.find(searchQuery)
    .sort({ _id: -1 })
    .limit(CONFIGS.NOTICE_PAGESIZE)
    .skip(skipPage);

  return res.status(200).json({
    ok: true,
    msg: "검색 결과",
    status: 200,
    data: {
      notices: searchedNotices,
      total,
    },
  });
};
