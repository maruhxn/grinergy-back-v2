import HttpException from "@/libs/http-exception";
import Notice from "@/models/Notice";
import { NextFunction } from "express";
import { getAllNotice, getOneNotice } from "./notice.controller";

const total = 12;
let mockNoticeData: any[] = [];
let req: any = {
  query: {
    page: 1,
  },
  params: {
    noticeId: "1",
  },
};

let res: any = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

let next: NextFunction = jest.fn();

beforeEach(() => {
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

describe("createNotice", () => {});
describe("updateNotice", () => {});
describe("deleteNotice", () => {});
