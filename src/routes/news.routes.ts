import {
  createNews,
  deleteNews,
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
  .route("/:NewsId")
  .get(catchAsync(getOneNews))
  .post(isLoggedIn, catchAsync(updateNews))
  .delete(isLoggedIn, catchAsync(deleteNews));

export default router;
