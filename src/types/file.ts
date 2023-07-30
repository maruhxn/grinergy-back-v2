import { z } from "zod";

export const FileValidator = z.object({
  filePath: z.string(),
  fileName: z.string(),
});

export type File = z.infer<typeof FileValidator>;
