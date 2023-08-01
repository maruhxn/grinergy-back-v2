import jwt from "jsonwebtoken";
import { isLoggedIn, isNotLoggedIn } from "./auth.guard";

let req = {
  headers: {
    authorization: "Bearer valid-token",
  },
} as any;
const res = {} as any;
const next = jest.fn() as any;
const verifySpy = jest.spyOn(jwt, "verify");

beforeEach(() => {
  req.headers.authorization = "";
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("isLoggedIn", () => {
  it("token이 valid 하면 req.isValid를 true로 세팅 후 next() 호출", () => {
    req.headers.authorization = "Bearer valid-token";

    verifySpy.mockReturnValue({ isValid: true } as any);

    isLoggedIn(req, res, next);

    expect(verifySpy).toHaveBeenCalledWith("valid-token", expect.any(String));
    expect(req.isValid).toBe(true);
    expect(next).toHaveBeenCalled();
  });

  it("token이 존재하지 않는다면, 401 error 반환", () => {
    req.headers = {};

    isLoggedIn(req, res, next);

    expect(verifySpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({ message: "로그인이 필요합니다.", status: 401 })
    );
  });

  it("token이 invalid하다면 401 error 반환", () => {
    (req.headers.authorization = "Bearer invalid-token"),
      verifySpy.mockImplementation(() => {
        throw new Error("Invalid token");
      });

    isLoggedIn(req, res, next);

    expect(verifySpy).toHaveBeenCalledWith("invalid-token", expect.any(String));
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "유효하지 않은 토큰입니다.",
        status: 401,
      })
    );
  });
});

describe("isNotLoggedIn", () => {
  it("token이 존재하지 않으면 next 호출", () => {
    req.headers = {};
    isNotLoggedIn(req, res, next);

    expect(verifySpy).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });

  it("should call next() with an HttpException if a valid token is present in the request", () => {
    req.headers.authorization = "Bearer valid-token";

    // Create a spy for jwt.verify method
    const verifySpy = jest
      .spyOn(jwt, "verify")
      .mockReturnValue({ isValid: true } as any);

    isNotLoggedIn(req, res, next);

    expect(verifySpy).toHaveBeenCalledWith("valid-token", expect.any(String));
    expect(req.isValid).toBe(true);
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "이미 로그인 되어 있습니다.",
        status: 403,
      })
    );
  });

  it("token이 유효하지 않다면, 로그인되어 있지 않으므로 next() 호출", () => {
    req.headers.authorization = "Bearer invalid-token";

    // Create a spy for jwt.verify method
    const verifySpy = jest.spyOn(jwt, "verify").mockImplementation(() => {
      throw new Error("Invalid token");
    });

    isNotLoggedIn(req, res, next);

    expect(verifySpy).toHaveBeenCalledWith("invalid-token", expect.any(String));
    expect(next).toHaveBeenCalled();
  });
});
