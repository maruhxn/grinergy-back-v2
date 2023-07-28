import HttpException from "@/lib/http-exception";
import { validateAdmin } from "./auth.controller";

describe("validateAdmin", () => {
  let validationKey: string;
  let req = {
    body: {
      validationKey: "",
    },
    session: {
      isValid: false,
      ip: "",
    },
    ip: "ipAddress",
  };
  let res: any = {
    status: jest.fn(() => res),
    json: jest.fn(),
  };
  let next = jest.fn();

  describe("if the KEY is valid", () => {
    it("should save session with ip", () => {
      req.body.validationKey = "DIAGRAM";

      validateAdmin(req as any, res, next);
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
