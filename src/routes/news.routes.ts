import {
  createNews,
  deleteOneNews,
  getAllNews,
  getOneNews,
  updateNews,
} from "@/controllers/news.controller";
import catchAsync from "@/libs/catch-async";
import { isLoggedIn } from "@/middlewares/auth.guard";
import express from "express";

const router = express.Router();

router.route("/").get(catchAsync(getAllNews)).post(catchAsync(createNews));

router
  .route("/:newsId")
  .get(catchAsync(getOneNews))
  .post(isLoggedIn, catchAsync(updateNews))
  .delete(isLoggedIn, catchAsync(deleteOneNews));

export default router;
