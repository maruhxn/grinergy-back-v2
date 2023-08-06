import client from "@/configs/s3-client";
import dotenv from "dotenv";
import multer from "multer";
import multerS3 from "multer-s3";
import path from "path";

dotenv.config();

const upload = multer({
  storage: multerS3({
    s3: client,
    bucket: process.env.S3_BUCKET_NAME!,
    key(req, file, cb) {
      cb(null, `original/${Date.now()}${path.basename(file.originalname)}`);
    },
  }),
  limits: { fileSize: 100 * 1024 * 1024 },
});

export default upload;
