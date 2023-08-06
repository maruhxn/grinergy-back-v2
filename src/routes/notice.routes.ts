import {
  createNotice,
  deleteOneNotice,
  getAllNotice,
  getOneNotice,
  updateNotice,
} from "@/controllers/notice.controller";
import catchAsync from "@/libs/catch-async";
import { isLoggedIn } from "@/middlewares/auth.guard";
import upload from "@/middlewares/multer";
import express from "express";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(getAllNotice))
  .post(isLoggedIn, upload.array("files"), catchAsync(createNotice));

router
  .route("/:noticeId")
  .get(catchAsync(getOneNotice))
  .put(isLoggedIn, upload.array("files"), catchAsync(updateNotice))
  .delete(isLoggedIn, catchAsync(deleteOneNotice));

export default router;
