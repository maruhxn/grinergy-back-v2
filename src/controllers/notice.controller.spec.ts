import HttpException from "@/libs/http-exception";
import Notice from "@/models/Notice";
import { NextFunction } from "express";
import * as fs from "fs";
import { z } from "zod";
import {
  createNotice,
  deleteOneNotice,
  getAllNotice,
  getOneNotice,
  updateNotice,
} from "./notice.controller";

let req: any, res: any, next: NextFunction, mockNoticeData: any[];

jest.mock("fs", () => ({
  unlink: jest.fn(),
}));

const total = 12;

beforeEach(() => {
  req = {
    query: {
      page: 1,
    },
    params: {
      noticeId: "1",
    },
    session: {
      isValid: true,
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
      contents: `contents ${i}`,
      files: [
        {
          filePath: `filePath ${i}`,
          fileName: `fileName ${i}`,
        },
      ],
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
    it("req.files가 있으면, files를 포함한 notice 1개 생성", async () => {
      (req.files = [
        {
          path: "filePath1",
          filename: "fileName1",
        },
        {
          path: "filePath2",
          filename: "fileName2",
        },
      ] as Express.Multer.File[]),
        (req.body = {
          title: "title",
          contents: "contents",
        });

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
      expect(mockNoticeData[mockNoticeData.length - 1]).toEqual(
        expect.objectContaining({
          files: [
            {
              filePath: "filePath1",
              fileName: "fileName1",
            },
            {
              filePath: "filePath2",
              fileName: "fileName2",
            },
          ],
        })
      );
    });

    it("req.files가 없다면, files를 포함하지 않는 notice 1개 생성", async () => {
      req.body = {
        title: "title",
        contents: "contents",
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
  const mockUpdate = jest.spyOn(Notice, "findByIdAndUpdate");

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
  describe("올바른 body가 들어왔을 때, ", () => {
    describe("deletedFiles가 있고,", () => {
      it("req.files가 있으면, deletedFiles의 원소와 일치하는 fileName를 갖는 file을 삭제 후, 새로운 files를 포함하는 update된 object를 반환.", async () => {
        const { noticeId } = req.params;
        (req.files = [
          {
            path: "addedFilePath1",
            filename: "addedFileName1",
          },
          {
            path: "addedFilePath2",
            filename: "addedFileName2",
          },
        ] as Express.Multer.File[]),
          (req.body = {
            title: "Updated Notice Title",
            contents: "Updated Notice Contents",
            deletedFiles: [`fileName ${noticeId}`],
          });

        const updatedNotice = {
          _id: noticeId,
          title: req.body.title,
          contents: req.body.contents,
          files: [
            {
              filePath: "addedfilePath1",
              fileName: "addedfileName1",
            },
            {
              filePath: "addedfilePath2",
              fileName: "addedfileName2",
            },
          ],
        };

        mockUpdate.mockResolvedValue(updatedNotice);
        await updateNotice(req, res, next);

        expect(res.status).toBeCalledTimes(1);
        expect(res.json).toBeCalledTimes(1);
        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({
          ok: true,
          msg: `공지사항-(${noticeId}) 수정`,
          status: 201,
          data: updatedNotice,
        });
        expect(fs.unlink).toBeCalledTimes(req.body.deletedFiles.length);
        req.body.deletedFiles.forEach((deletedFileName: string) => {
          expect(fs.unlink).toHaveBeenCalledWith(
            `uploads/${deletedFileName}`,
            expect.any(Function)
          );
        });
        expect(mockUpdate).toBeCalledTimes(2);
      });

      it("req.files가 없으면, deletedFiles의 원소와 일치하는 fileName를 갖는 file들이 삭제 된 object를 반환.", async () => {
        const { noticeId } = req.params;
        req.body = {
          title: "Updated Notice Title",
          contents: "Updated Notice Contents",
          deletedFiles: [`fileName ${noticeId}`],
        };
        const updatedNotice = {
          _id: noticeId,
          title: req.body.title,
          contents: req.body.contents,
          files: [],
        };
        mockUpdate.mockResolvedValue(updatedNotice);

        await updateNotice(req, res, next);

        expect(res.status).toBeCalledTimes(1);
        expect(res.json).toBeCalledTimes(1);
        expect(res.status).toBeCalledWith(201);
        expect(mockUpdate).toBeCalledTimes(2);
        expect(res.json).toBeCalledWith({
          ok: true,
          msg: `공지사항-(${noticeId}) 수정`,
          status: 201,
          data: updatedNotice,
        });
        expect(fs.unlink).toBeCalledTimes(req.body.deletedFiles.length);
        req.body.deletedFiles.forEach((deletedFileName: string) => {
          expect(fs.unlink).toHaveBeenCalledWith(
            `uploads/${deletedFileName}`,
            expect.any(Function)
          );
        });
        expect(mockUpdate.mock.calls).toHaveLength(2);
      });
    });

    describe("deletedFiles가 없고,", () => {
      it("req.files가 있으면, 새로운 files를 포함하는 update된 object를 반환.", async () => {
        const { noticeId } = req.params;
        (req.files = [
          {
            path: "addedFilePath1",
            filename: "addedFileName1",
          },
          {
            path: "addedFilePath2",
            filename: "addedFileName2",
          },
        ] as Express.Multer.File[]),
          (req.body = {
            title: "Updated Notice Title",
            contents: "Updated Notice Contents",
          });

        const updatedNotice = {
          _id: noticeId,
          title: req.body.title,
          contents: req.body.contents,
          files: [
            {
              filePath: "filePath " + noticeId,
              fileName: "fileName " + noticeId,
            },
            {
              filePath: "addedfilePath1",
              fileName: "addedfileName1",
            },
            {
              filePath: "addedfilePath2",
              fileName: "addedfileName2",
            },
          ],
        };

        mockUpdate.mockResolvedValue(updatedNotice);

        await updateNotice(req, res, next);

        expect(res.status).toBeCalledTimes(1);
        expect(res.json).toBeCalledTimes(1);
        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({
          ok: true,
          msg: `공지사항-(${noticeId}) 수정`,
          status: 201,
          data: updatedNotice,
        });
        expect(mockUpdate.mock.calls).toHaveLength(1);
      });

      it("req.files가 없으면, title과 contents만 수정", async () => {
        const { noticeId } = req.params;
        req.body = {
          title: "Updated Notice Title1",
          contents: "Updated Notice Contents1",
        };
        const updatedNotice = {
          _id: noticeId,
          title: req.body.title,
          contents: req.body.contents,
          files: [
            {
              filePath: "filePath " + noticeId,
              fileName: "fileName " + noticeId,
            },
          ],
        };
        mockUpdate.mockResolvedValue(updatedNotice);

        await updateNotice(req, res, next);

        expect(res.status).toBeCalledTimes(1);
        expect(res.json).toBeCalledTimes(1);
        expect(res.status).toBeCalledWith(201);
        expect(res.json).toBeCalledWith({
          ok: true,
          msg: `공지사항-(${noticeId}) 수정`,
          status: 201,
          data: updatedNotice,
        });
        expect(mockUpdate.mock.calls).toHaveLength(1);
      });
    });
  });

  it("params로 올바르지 않은 noticeId가 들어오면 404 error 반환", async () => {
    req.params.noticeId = "invalid params";
    req.body = {
      title: "Updated Notice Title",
      contents: "Updated Notice Contents",
    };

    try {
      await updateNotice(req, res, next);
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

describe("deleteNotice", () => {
  const mockDelete = jest.spyOn(Notice, "findByIdAndDelete");

  it("params로 noticeId가 들어오면 해당 notice를 삭제", async () => {
    const { noticeId } = req.params;
    const deletedNotice = {
      _id: noticeId,
      title: "Deleted Notice Title",
      contents: "Deleted Notice Contents",
      files: [
        {
          filePath: `filePath ${noticeId}`,
          fileName: `fileName ${noticeId}`,
        },
      ],
    };
    mockDelete.mockResolvedValue(deletedNotice);
    await deleteOneNotice(req, res, next);

    expect(res.status).toBeCalledTimes(1);
    expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(mockDelete).toBeCalledTimes(1);
    expect(mockDelete).toBeCalledWith(noticeId);
    expect(fs.unlink).toHaveBeenCalledTimes(deletedNotice.files.length);
    deletedNotice.files.forEach((deletedFile) => {
      expect(fs.unlink).toHaveBeenCalledWith(
        `uploads/${deletedFile.fileName}`,
        expect.any(Function)
      );
    });
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: `공지사항-(${noticeId}) 삭제`,
      status: 201,
      data: deletedNotice,
    });
  });
  it("params로 올바르지 않은 noticeId가 들어오면 404 error 반환", async () => {
    req.params.noticeId = "invalid params";
    mockDelete.mockResolvedValue(null);
    try {
      await deleteOneNotice(req, res, next);
    } catch (err: any) {
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(404);
      expect(mockDelete).toBeCalledWith(req.params.noticeId);
      expect(fs.unlink).not.toHaveBeenCalled();
    }
  });
});
