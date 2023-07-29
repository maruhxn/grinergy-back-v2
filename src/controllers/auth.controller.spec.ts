import HttpException from "@/libs/http-exception";
import { auth, logout, validateAdmin } from "./auth.controller";

let req: any, res: any, next: any;

beforeEach(() => {
  req = {
    body: {
      validationKey: "",
    },
    session: {
      isValid: false,
      ip: "",
      destroy: (callback: (err: any) => void) => {
        callback(null);
      },
    },
    ip: "ipAddress",
  };
  res = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  next = jest.fn();
});

describe("validateAdmin", () => {
  describe("if the KEY is valid", () => {
    it("should save session with ip", () => {
      req.body.validationKey = "DIAGRAM";

      validateAdmin(req, res, next);
      expect(res.json).toBeCalledTimes(1);
      expect(req.session).toEqual(
        expect.objectContaining({
          isValid: true,
          ip: "ipAddress",
        })
      );
      expect(res.json).toBeCalledWith({
        ok: true,
        msg: "인증 성공",
        status: 200,
      });
    });
  });

  describe("if the KEY is invalid", () => {
    it("should return Unauthorized error", () => {
      req.body.validationKey = "";
      try {
        validateAdmin(req as any, res, next);
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(401);
      }
    });
  });
});

describe("auth", () => {
  it("should return status 200 if req.session.isValid is true", () => {
    req.session.isValid = true;
    auth(req, res, next);
    expect(res.json).toBeCalledTimes(1);
    expect(req.session).toEqual(
      expect.objectContaining({
        isValid: true,
      })
    );
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: "인증 성공",
      status: 200,
    });
  });
  it("should return Unauthorized error if req.session.isValid is false or undefined", () => {
    req.session.isValid = false;
    try {
      auth(req, res, next);
    } catch (err: any) {
      expect(err).toBeInstanceOf(HttpException);
      expect(err.status).toBe(401);
    }
  });
});

describe("logout", () => {
  it("should clear the req.session", () => {
    logout(req, res, next);
    // expect(res.json).toBeCalledTimes(1);
    expect(res.status).toBeCalledWith(201);
    expect(res.json).toBeCalledWith({
      ok: true,
      msg: "로그아웃 성공",
      status: 201,
    });
  });

  it("should call next(err) if there is an error", () => {
    const mockError = new Error("Session destruction failed");
    req.session.destory = (callback: (err: any) => void) => {
      callback(mockError);
    };

    try {
      logout(req, res, next);
    } catch (error) {
      expect(next).toBeCalledWith(mockError);
      expect(next).toBeCalledTimes(1);
    }
  });
});
