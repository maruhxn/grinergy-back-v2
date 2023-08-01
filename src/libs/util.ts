import { File } from "@/types/file";

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
