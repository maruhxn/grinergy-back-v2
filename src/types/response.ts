import { Response } from "express";

export type TypedResponse<T> = Omit<Response, "json" | "status"> & {
  json(data: BaseResponse<T>): TypedResponse<T>;
} & { status(code: number): TypedResponse<T> };

export type BaseResponse<T> = {
  ok: boolean;
  msg: string;
  status: number;
  data?: T;
};
