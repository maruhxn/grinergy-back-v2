import { z } from "zod";
import { FileValidator } from "./file";

export const NewsValidator = z.object({
  image: FileValidator,
  title: z.string().min(1).max(100),
  contents: z.string().min(1),
  url: z.string().min(1),
});

export const UpdateNewsValidator = z.object({
  image: FileValidator.optional(),
  title: z.string().min(1).max(100).optional(),
  contents: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
});

export type News = z.infer<typeof NewsValidator>;

export interface INews extends News {}
