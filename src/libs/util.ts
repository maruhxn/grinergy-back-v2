import { File } from "@/types/file";
import { Request } from "express";

export const extractFiles = (multerFiles: Express.Multer.File[]) => {
  const extractedFiles = multerFiles.map(
    (file: Express.Multer.File) =>
      ({
        filePath: file.path as string,
        fileName: file.filename as string,
      } as File)
  );
  return extractedFiles;
};

export const extractOneFile = (multerFile: Express.Multer.File) => {
  return {
    filePath: multerFile.path as string,
    fileName: multerFile.filename as string,
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
