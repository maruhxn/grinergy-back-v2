import { z } from "zod";
import { FileSchema } from "./file";

export const NoticeSchema = z.object({
  title: z.string(),
  contents: z.string(),
  files: z.array(FileSchema).nullable(),
});

export type Notice = z.infer<typeof NoticeSchema>;

export interface NoticeObject extends Notice {
  _id: string;
}

export interface NoticeModel extends Document, Notice {}
