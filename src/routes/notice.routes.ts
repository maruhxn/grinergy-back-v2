import {
  createNotice,
  deleteNotice,
  getAllNotice,
  getOneNotice,
  updateNotice,
} from "@/controllers/notice.controller";
import catchAsync from "@/libs/catch-async";
import { isLoggedIn } from "@/middlewares/auth.guard";
import express from "express";

const router = express.Router();

router.route("/").get(catchAsync(getAllNotice)).post(catchAsync(createNotice));

router
  .route("/:noticeId")
  .get(catchAsync(getOneNotice))
  .post(isLoggedIn, catchAsync(updateNotice))
  .delete(isLoggedIn, catchAsync(deleteNotice));

export default router;
