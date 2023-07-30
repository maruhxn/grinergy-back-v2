import { z } from "zod";
import { FileValidator } from "./file";

export const NoticeValidator = z.object({
  title: z.string(),
  contents: z.string(),
  files: z.array(FileValidator).optional(),
});

export const UpdateNoticeValidator = z.object({
  title: z.string().min(1).max(100).optional(),
  contents: z.string().min(1).optional(),
  files: z.array(FileValidator).nullable().optional(),
});

export type Notice = z.infer<typeof NoticeValidator>;

export interface INotice extends Notice {}
