import HttpException from "@/libs/http-exception";
import News from "@/models/News";
import { File } from "@/types/file";
import { NextFunction } from "express";
import { z } from "zod";
import {
  createNews,
  deleteOneNews,
  getAllNews,
  getOneNews,
  updateNews,
} from "./news.controller";

let req: any, res: any, next: NextFunction, mockNewsData: any[];

const total = 12;

beforeEach(() => {
  mockNewsData = [];
  req = {
    query: {
      page: 1,
    },
    params: {
      newsId: "1",
    },
  };

  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };

  next = jest.fn();

  for (let i = 1; i <= total; i++) {
    mockNewsData.push({
      _id: i + "",
      image: `ImageUrl ${i}`,
      title: `News ${i}`,
      contents: `contents ${i}`,
      url: `url ${i}`,
    });
  }
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("getAllNews", () => {
  const mockFind = jest.fn().mockReturnValue({
    sort: jest.fn().mockReturnValue({
      limit: jest.fn().mockImplementation((pageSize) => {
        mockNewsData.splice(pageSize);
        return {
          skip: jest.fn().mockResolvedValue(mockNewsData),
        };
      }),
    }),
  });

  const mockCount = jest.fn().mockReturnValue(total);
  jest.spyOn(News, "find").mockImplementation(mockFind);
  jest.spyOn(News, "count").mockImplementation(mockCount);

  it("요청이 들어오면 News 배열을 반환해야 한다.", async () => {
    req.query = { page: "1" };

    await getAllNews(req, res, next);
    expect(res.status).toBeCalledWith(200);
    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: "뉴스 배열 반환",
      status: 200,
      data: {
        news: mockNewsData,
        total,
      },
    });
  });

  it("잘못된 query가 주어지면 400 error 반환", async () => {
    req.query = { page: "invalid-page" };

    try {
      await getAllNews(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(400);
    }
  });
});

describe("getOneNews", () => {
  jest
    .spyOn(News, "findById")
    .mockImplementation((newsId) =>
      mockNewsData.find((news) => news._id === newsId)
    );
  it("param으로 id가 주어지면 해당 News를 1개 반환해야한다.", async () => {
    req.params.newsId = "1";

    await getOneNews(req, res, next);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(200);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `뉴스-(1) 반환`,
      status: 200,
      data: mockNewsData[0],
    });
  });

  it("id에 해당하는 News가 없다면 404 에러 반환.", async () => {
    req.params.NewsId = "Invalid NewsId";
    try {
      await getOneNews(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
    }
  });
});

describe("createNews", () => {
  const mockCreate = jest
    .spyOn(News, "create")
    .mockImplementation((body: any) => {
      mockNewsData.push({ _id: mockNewsData.length + 1 + "", ...body });
      return { _id: mockNewsData.length + "", ...body };
    });
  it("올바르지 않은 body가 들어오면 validation error를 반환.", async () => {
    req.body = {
      image: {},
      title: "",
      contents: "",
      url: "",
    };
    try {
      await createNews(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(mockCreate).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(z.ZodError);
    }
  });

  it("올바른 body가 들어오면 news를 1개 생성.", async () => {
    req.body = {
      image: {
        fileName: "imageName",
        filePath: "imagePath",
      } as File,
      title: "title",
      contents: "contents",
      url: "url",
    };

    await createNews(req, res, next);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `뉴스-(${mockNewsData.length}) 생성`,
      status: 201,
      data: mockNewsData[mockNewsData.length - 1],
    });
  });
});

describe("updateNews", () => {
  const mockUpdate = jest
    .spyOn(News, "findOneAndUpdate")
    .mockImplementation((key: any, body: any) => {
      let selectedNewsIdx = mockNewsData.findIndex(
        (news) => news._id === key._id
      );
      if (selectedNewsIdx === -1) return null;
      mockNewsData[selectedNewsIdx] = {
        ...mockNewsData[selectedNewsIdx],
        ...body,
      };
      return mockNewsData[selectedNewsIdx];
    });
  it("올바르지 않은 body가 들어오면 validation error를 반환.", async () => {
    req.body = {
      image: {},
      title: "",
      contents: "",
      url: "",
      hacked: "hacked",
    };
    try {
      await updateNews(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(mockUpdate).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(z.ZodError);
    }
  });

  it("올바른 body가 들어오면 news를 1개 생성.", async () => {
    req.body = {
      image: {
        fileName: "imageName",
        filePath: "imagePath",
      } as File,
      title: "titleUpdated",
      contents: "contents",
      url: "url",
    };
    const { newsId } = req.params;

    await updateNews(req, res, next);

    const selectedNewsIdx = mockNewsData.findIndex(
      (news) => news._id === newsId
    );

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `뉴스-(${newsId}) 수정`,
      status: 201,
      data: mockNewsData[selectedNewsIdx],
    });
  });

  it("params로 올바르지 않은 newsId가 들어오면 404 error 반환", async () => {
    req.params.newsId = "invalid params";
    req.body = {
      title: "titleUpdated",
    };

    try {
      await updateNews(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
    }
  });
});
describe("deleteNews", () => {
  let deletedNews: any = null;
  const mockDelete = jest
    .spyOn(News, "findByIdAndDelete")
    .mockImplementation((newsId: string) => {
      let selectedNewsIdx = mockNewsData.findIndex(
        (news) => news._id === newsId
      );
      if (selectedNewsIdx === -1) return null;
      deletedNews = mockNewsData.splice(selectedNewsIdx, 1);
      return deletedNews;
    });
  it("params로 newsId가 들어오면 해당 news를 삭제", async () => {
    const { newsId } = req.params;
    await deleteOneNews(req, res, next);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(mockDelete).toBeCalledTimes(1);
    expect(mockDelete).toBeCalledWith(newsId);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `뉴스-(${newsId}) 삭제`,
      status: 201,
      data: deletedNews,
    });
  });
  it("params로 올바르지 않은 newsId가 들어오면 404 error 반환", async () => {
    req.params.newsId = "invalid params";

    try {
      await deleteOneNews(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
    }
  });
});
