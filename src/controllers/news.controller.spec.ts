import HttpException from "@/libs/http-exception";
import News from "@/models/News";
import { NextFunction } from "express";
import { getAllNews, getOneNews } from "./news.controller";

const total = 12;
let mockNewsData: any[] = [];
let req: any = {
  query: {
    page: 1,
  },
  params: {
    NewsId: "1",
  },
};

let res: any = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
};

let next: NextFunction = jest.fn();

beforeEach(() => {
  mockNewsData = [];
  for (let i = 1; i <= total; i++) {
    mockNewsData.push({
      _id: i + "",
      title: `News ${i}`,
      content: `content ${i}`,
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

describe("createNews", () => {});
describe("updateNews", () => {});
describe("deleteNews", () => {});
