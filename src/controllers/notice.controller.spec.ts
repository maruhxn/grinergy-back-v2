import HttpException from "@/libs/http-exception";
import Notice from "@/models/Notice";
import { File } from "@/types/file";
import { NextFunction } from "express";
import { z } from "zod";
import {
  createNotice,
  deleteOneNotice,
  getAllNotice,
  getOneNotice,
  updateNotice,
} from "./notice.controller";

let req: any, res: any, next: NextFunction, mockNoticeData: any[];

const total = 12;

beforeEach(() => {
  req = {
    query: {
      page: 1,
    },
    params: {
      noticeId: "1",
    },
  };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  next = jest.fn();
  mockNoticeData = [];
  for (let i = 1; i <= total; i++) {
    mockNoticeData.push({
      _id: i + "",
      title: `Notice ${i}`,
      content: `content ${i}`,
    });
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("getAllNotice", () => {
  const mockFind = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockImplementation((pageSize) => {
        mockNoticeData.splice(pageSize);
        return {
          skip: jest.fn().mockResolvedValue(mockNoticeData),
        };
      }),
    }),
  });

  const mockCount = jest.fn().mockReturnValue(total);
  jest.spyOn(Notice, "find").mockImplementation(mockFind);
  jest.spyOn(Notice, "count").mockImplementation(mockCount);

  it("요청이 들어오면 Notice 배열을 반환해야 한다.", async () => {
    req.query = { page: "1" };

    await getAllNotice(req, res, next);
    expect(res.status).toBeCalledWith(200);
    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: "공지사항 배열 반환",
      status: 200,
      data: {
        notices: mockNoticeData,
        total,
      },
    });
  });

  it("잘못된 query가 주어지면 400 error 반환", async () => {
    req.query = { page: "invalid-page" };

    try {
      await getAllNotice(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(400);
    }
  });
});

describe("getOneNotice", () => {
  jest
    .spyOn(Notice, "findById")
    .mockImplementation((noticeId) =>
      mockNoticeData.find((notice) => notice._id === noticeId)
    );
  it("param으로 id가 주어지면 해당 notice를 1개 반환해야한다.", async () => {
    req.params.noticeId = "1";

    await getOneNotice(req, res, next);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `공지사항-(1) 반환`,
      status: 200,
      data: mockNoticeData[0],
    });
  });

  it("id에 해당하는 notice가 없다면 404 에러 반환.", async () => {
    req.params.noticeId = "Invalid NoticeId";
    try {
      await getOneNotice(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
    }
  });
});

describe("createNotice", () => {
  const mockCreate = jest
    .spyOn(Notice, "create")
    .mockImplementation((body: any) => {
      mockNoticeData.push({ _id: mockNoticeData.length + 1 + "", ...body });
      return { _id: mockNoticeData.length + "", ...body };
    });
  it("올바르지 않은 body가 들어오면 validation error를 반환.", async () => {
    req.body = {
      title: "",
      contents: "",
      hacked: "hacked",
    };
    try {
      await createNotice(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(z.ZodError);
    }
  });

  describe("올바른 body가 들어왔을 때, ", () => {
    it("files가 있으면, files를 포함한 notice 1개 생성", async () => {
      req.body = {
        files: [
          {
            fileName: "imageName",
            filePath: "imagePath",
          },
        ] as File[],
        title: "title",
        contents: "contents",
        url: "url",
      };

      await createNotice(req, res, next);

      expect(res.status).toBeCalledTimes(1);
      expect(res.json).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(201);
      expect(res.json).toBeCalledWith({
        ok: true,
        msg: `공지사항-(${mockNoticeData.length}) 생성`,
        status: 201,
        data: mockNoticeData[mockNoticeData.length - 1],
      });
    });

    it("files가 없다면, files를 포함하지 않는 notice 1개 생성", async () => {
      req.body = {
        title: "title",
        contents: "contents",
        url: "url",
      };

      await createNotice(req, res, next);

      expect(res.status).toBeCalledTimes(1);
      expect(res.json).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(201);
      expect(res.json).toBeCalledWith({
        ok: true,
        msg: `공지사항-(${mockNoticeData.length}) 생성`,
        status: 201,
        data: mockNoticeData[mockNoticeData.length - 1],
      });
      expect(mockNoticeData[mockNoticeData.length - 1].files).toBeUndefined();
    });
  });
});

describe("updateNotice", () => {
  const mockUpdate = jest
    .spyOn(Notice, "findOneAndUpdate")
    .mockImplementation((key: any, body: any) => {
      let selectedNoticeIdx = mockNoticeData.findIndex(
        (notice) => notice._id === key._id
      );
      if (selectedNoticeIdx === -1) return null;
      mockNoticeData[selectedNoticeIdx] = {
        ...mockNoticeData[selectedNoticeIdx],
        ...body,
      };
      return mockNoticeData[selectedNoticeIdx];
    });
  it("올바르지 않은 body가 들어오면 validation error를 반환.", async () => {
    req.body = {
      image: {},
      title: "",
      contents: "",
      url: "",
    };
    try {
      await updateNotice(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(z.ZodError);
    }
  });

  it("올바른 body가 들어오면 notice를 1개 생성.", async () => {
    req.body = {
      title: "titleUpdated",
      contents: "contentsUpdated",
    };
    const { noticeId } = req.params;

    await updateNotice(req, res, next);

    const selectedNoticeIdx = mockNoticeData.findIndex(
      (notice) => notice._id === noticeId
    );

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `공지사항-(${noticeId}) 수정`,
      status: 201,
      data: mockNoticeData[selectedNoticeIdx],
    });
  });

  it("params로 올바르지 않은 noticeId가 들어오면 404 error 반환", async () => {
    req.params.noticeId = "invalid params";
    req.body = {
      title: "titleUpdated",
    };

    try {
      await updateNotice(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
    }
  });
});

describe("deleteNotice", () => {
  let deletedNotice: any = null;
  const mockDelete = jest
    .spyOn(Notice, "findByIdAndDelete")
    .mockImplementation((noticeId: string) => {
      let selectedNoticeIdx = mockNoticeData.findIndex(
        (notice) => notice._id === noticeId
      );
      if (selectedNoticeIdx === -1) return null;
      deletedNotice = mockNoticeData.splice(selectedNoticeIdx, 1);
      return deletedNotice;
    });
  it("params로 noticeId가 들어오면 해당 notice를 삭제", async () => {
    const { noticeId } = req.params;
    await deleteOneNotice(req, res, next);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(mockDelete).toBeCalledTimes(1);
    expect(mockDelete).toBeCalledWith(noticeId);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `공지사항-(${noticeId}) 삭제`,
      status: 201,
      data: deletedNotice,
    });
  });
  it("params로 올바르지 않은 noticeId가 들어오면 404 error 반환", async () => {
    req.params.noticeId = "invalid params";

    try {
      await deleteOneNotice(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
    }
  });
});
