import HttpException from "@/libs/http-exception";
import jwt from "jsonwebtoken";
import { login } from "./auth.controller";

jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

let req: any, res: any, next: any;

beforeEach(() => {
  req = {
    body: {
      validationKey: "DIAGRAM",
    },
  };
  res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  next = jest.fn();
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("login", () => {
  it("key가 올바르면 accessToken을 발급해야 한다.", async () => {
    const token = "mocked-token";
    (jwt.sign as jest.Mock).mockReturnValue(token);

    await login(req, res, next);

    expect(jwt.sign).toHaveBeenCalledWith(
      { isValid: true },
      expect.any(String), // process.env.COOKIE_SECRET
      { expiresIn: "3d", algorithm: "HS256" }
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      ok: true,
      msg: "인증 성공",
      status: 200,
      data: token,
    });
  });

  describe("Key가 올바르지 않으면 401 error 반환", () => {
    it("should return Unauthorized error", async () => {
      req.body.validationKey = "";
      try {
        await login(req as any, res, next);
      } catch (err: any) {
        expect(err).toBeInstanceOf(HttpException);
        expect(err.status).toBe(401);
      }
    });
  });
});
