import { z } from "zod";

export const NewsSchema = z.object({
  image: z.string(),
  title: z.string().min(1).max(100),
  contents: z.string().min(1),
  url: z.string().min(1),
});

export type File = z.infer<typeof NewsSchema>;
