import HttpException from "@/libs/http-exception";
import News from "@/models/News";
import { NextFunction } from "express";
import * as fs from "fs";
import { z } from "zod";
import {
  createNews,
  deleteOneNews,
  getAllNews,
  getNewsStartWithQuery,
  getOneNews,
  updateNews,
} from "./news.controller";

let req: any, res: any, next: NextFunction, mockNewsData: any[];

jest.mock("fs", () => ({
  unlink: jest.fn(),
}));

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
  mockNewsData = [];
  for (let i = 1; i <= total; i++) {
    mockNewsData.push({
      _id: i + "",
      image: {
        filePath: `filePath ${i}`,
        fileName: `fileName ${i}`,
      },
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
  const mockFindAll = jest.spyOn(News, "find");
  const mockCount = jest.spyOn(News, "count").mockResolvedValue(total);

  it("요청이 들어오면 News 배열(최대 10개)을 반환해야 한다.", async () => {
    req.query = { page: "1" };

    const results = mockNewsData.slice(0, 10);

    mockFindAll.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(results),
        }),
      }),
    } as any);

    await getAllNews(req, res, next);
    expect(res.status).toBeCalledWith(200);
    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: "뉴스 배열 반환",
      status: 200,
      data: {
        news: results,
        total,
      },
    });
    expect(mockCount).toBeCalledTimes(1);
    expect(mockFindAll).toBeCalledTimes(1);
    expect(results.length).toBeLessThanOrEqual(10);
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
      expect(mockCount).not.toBeCalled();
      expect(mockFindAll).not.toBeCalled();
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
  const mockCreate = jest.spyOn(News, "create");

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
    (req.file = {
      location: "Created FilePath",
      originalname: "Created FileName",
    } as Express.MulterS3.File),
      (req.body = {
        title: "Created News Title",
        contents: "Created News Contents",
        url: "Created News Url",
        image: {
          filePath: "Created FilePath",
          fileName: "Created FileName",
        },
      });

    const createdNews = {
      _id: "Created News Id",
      image: {
        filePath: "Created FilePath",
        fileName: "Created FileName",
      },
      title: req.body.title,
      contents: req.body.contents,
      url: req.body.url,
    };
    mockCreate.mockResolvedValue(createdNews as any);

    await createNews(req, res, next);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(mockCreate).toBeCalledTimes(1);
    expect(mockCreate).toBeCalledWith({
      image: {
        filePath: "Created FilePath",
        fileName: "Created FileName",
      },
      title: req.body.title,
      contents: req.body.contents,
      url: req.body.url,
    });
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `뉴스-(Created News Id) 생성`,
      status: 201,
      data: createdNews,
    });
  });
});

describe("updateNews", () => {
  const mockUpdate = jest.spyOn(News, "findByIdAndUpdate");

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

  describe("올바른 body가 들어왔을 때", () => {
    it("req.file이 있으면, news를 수정하고 기존 이미지 삭제.", async () => {
      (req.file = {
        location: "Updated FilePath",
        originalname: "Updated FileName",
      } as Express.MulterS3.File),
        (req.body = {
          title: "Updated News Title",
          contents: "Updated News Contents",
          url: "Updated News Url",
        });

      const oldNews = {
        image: {
          filePath: "Old FilePath",
          fileName: "Old FileName",
        },
        title: "Old Title",
        contents: "Old Contents",
        url: "Old Url",
      };

      mockUpdate.mockResolvedValue(oldNews);

      const updateObject = {
        image: {
          filePath: "Updated FilePath",
          fileName: "Updated FileName",
        },
        title: req.body.title,
        contents: req.body.contents,
        url: req.body.url,
      };

      const { newsId } = req.params;

      await updateNews(req, res, next);

      expect(res.status).toBeCalledTimes(1);
      expect(res.json).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(201);
      expect(res.json).toBeCalledWith({
        ok: true,
        msg: `뉴스-(${newsId}) 수정`,
        status: 201,
      });
      expect(mockUpdate).toBeCalledTimes(1);
      expect(mockUpdate).toBeCalledWith(newsId, updateObject);
      expect(fs.unlink).toBeCalledTimes(1);
      expect(fs.unlink).toHaveBeenCalledWith(
        `uploads/${oldNews.image.fileName}`,
        expect.any(Function)
      );
    });
    it("req.file이 없으면, title, contents, url만을 가지고 news를 수정.", async () => {
      req.body = {
        title: "Updated News Title",
        contents: "Updated News Contents",
        url: "Updated News Url",
      };
      const oldNews = {
        image: {
          filePath: "Old FilePath",
          fileName: "Old FileName",
        },
        title: "Old Title",
        contents: "Old Contents",
        url: "Old Url",
      };

      mockUpdate.mockResolvedValue(oldNews);

      const updateObject = {
        title: req.body.title,
        contents: req.body.contents,
        url: req.body.url,
      };

      const { newsId } = req.params;

      await updateNews(req, res, next);

      expect(res.status).toBeCalledTimes(1);
      expect(res.json).toBeCalledTimes(1);
      expect(res.status).toBeCalledWith(201);
      expect(res.json).toBeCalledWith({
        ok: true,
        msg: `뉴스-(${newsId}) 수정`,
        status: 201,
      });
      expect(mockUpdate).toBeCalledTimes(1);
      expect(mockUpdate).toBeCalledWith(newsId, updateObject);
    });
  });

  it("params로 올바르지 않은 newsId가 들어오면 404 error 반환", async () => {
    req.params.newsId = "invalid params";
    req.body = {
      title: "Updated News Title",
      contents: "Updated News Contents",
      url: "Updated News Url",
    };
    mockUpdate.mockResolvedValue(null);

    try {
      await updateNews(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
      expect(mockUpdate).toBeCalledTimes(1);
      expect(fs.unlink).not.toBeCalled();
    }
  });
});
describe("deleteNews", () => {
  const mockDelete = jest.spyOn(News, "findByIdAndDelete");

  it("params로 newsId가 들어오면 해당 news를 삭제", async () => {
    const { newsId } = req.params;
    const deletedNews = {
      _id: newsId,
      title: "Deleted News Title",
      contents: "Deleted News Contents",
      image: {
        filePath: `filePath ${newsId}`,
        fileName: `fileName ${newsId}`,
      },
    };
    mockDelete.mockResolvedValue(deletedNews);
    await deleteOneNews(req, res, next);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(mockDelete).toBeCalledTimes(1);
    expect(mockDelete).toBeCalledWith(newsId);
    expect(fs.unlink).toHaveBeenCalledTimes(1);
    expect(fs.unlink).toHaveBeenCalledWith(
      `uploads/${deletedNews.image.fileName}`,
      expect.any(Function)
    );
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `뉴스-(${newsId}) 삭제`,
      status: 201,
      data: deletedNews,
    });
  });
  it("params로 올바르지 않은 newsId가 들어오면 404 error 반환", async () => {
    req.params.newsId = "invalid params";
    mockDelete.mockResolvedValue(null);
    try {
      await deleteOneNews(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
      expect(mockDelete).toBeCalledWith(req.params.newsId);
      expect(fs.unlink).not.toHaveBeenCalled();
    }
  });
});

describe("getNewsStartWithQuery", () => {
  const mockFind = jest.spyOn(News, "find");
  const mockCount = jest.spyOn(News, "countDocuments").mockResolvedValue(total);
  it("올바른 q 및 page가 들어오면, 해당 쿼리로 시작하는 news(최대 10개)와 전체 news 개수를 반환", async () => {
    req.query = {
      q: "Search Query",
      page: "1",
    };

    const searchedNews = [
      {
        _id: "Searched News ID",
        title: "Search Query with Title",
        contents: "Searched News Contents",
        files: [
          {
            filePath: "Searched News filePath",
            fileName: "Searched News fileName",
          },
        ],
      },
    ];

    mockFind.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          skip: jest.fn().mockResolvedValue(searchedNews),
        }),
      }),
    } as any);

    await getNewsStartWithQuery(req, res, next);
    expect(res.status).toBeCalledWith(200);
    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: "검색 결과",
      status: 200,
      data: {
        searchedNews,
        total,
      },
    });
    expect(mockCount).toBeCalledTimes(1);
    expect(mockFind).toBeCalledTimes(1);
    expect(searchedNews.length).toBeLessThanOrEqual(10);
  });

  it("잘못된 query가 주어지면 400 error 반환", async () => {
    req.query = { q: "search query", page: "invalid-page" };

    try {
      await getNewsStartWithQuery(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(400);
      expect(mockCount).not.toBeCalled();
      expect(mockFind).not.toBeCalled();
    }
  });

  it("q가 없다면, 400 error 반환", async () => {
    req.query = { page: "1" };

    try {
      await getNewsStartWithQuery(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(400);
      expect(mockCount).not.toBeCalled();
      expect(mockFind).not.toBeCalled();
    }
  });

  it("search와 q 모두 없다면, 400 error 반환", async () => {
    req.query = {};

    try {
      await getNewsStartWithQuery(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(400);
      expect(mockCount).not.toBeCalled();
      expect(mockFind).not.toBeCalled();
    }
  });
});
