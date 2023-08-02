import { File } from "@/types/file";
import { Request } from "express";

export const extractFiles = (multerFiles: Express.MulterS3.File[]) => {
  const extractedFiles = multerFiles.map(
    (file: Express.MulterS3.File) =>
      ({
        filePath: file.location as string,
        fileName: file.originalname as string,
      } as File)
  );
  return extractedFiles;
};

export const extractOneFile = (multerFile: Express.MulterS3.File) => {
  return {
    filePath: multerFile.location as string,
    fileName: multerFile.originalname as string,
  };
};

export const extractTokenFromRequest = (req: Request) => {
  const TOKEN_PREFIX = "Bearer ";
  const auth = req.headers.authorization;
  const token = auth?.includes(TOKEN_PREFIX)
    ? auth.split(TOKEN_PREFIX)[1]
    : auth;

  return token;
};
