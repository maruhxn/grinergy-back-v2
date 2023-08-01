import { getNewsStartWithQuery } from "@/controllers/news.controller";
import { getNoticeStartWithQuery } from "@/controllers/notice.controller";
import catchAsync from "@/libs/catch-async";
import express from "express";

const router = express.Router();

router.get("/notice", catchAsync(getNoticeStartWithQuery));

router.get("/news", catchAsync(getNewsStartWithQuery));

export default router;
