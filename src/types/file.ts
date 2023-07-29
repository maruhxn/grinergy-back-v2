import { z } from "zod";

export const FileSchema = z.object({
  filePath: z.string(),
  fileName: z.string(),
});

export type File = z.infer<typeof FileSchema>;
