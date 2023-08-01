import {
  createNews,
  deleteOneNews,
  getAllNews,
  getOneNews,
  updateNews,
} from "@/controllers/news.controller";
import catchAsync from "@/libs/catch-async";
import { isLoggedIn } from "@/middlewares/auth.guard";
import upload from "@/middlewares/multer";
import express from "express";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(getAllNews))
  .post(isLoggedIn, upload.single("file"), catchAsync(createNews));

router
  .route("/:newsId")
  .get(catchAsync(getOneNews))
  .put(isLoggedIn, upload.single("file"), catchAsync(updateNews))
  .delete(isLoggedIn, catchAsync(deleteOneNews));

export default router;
