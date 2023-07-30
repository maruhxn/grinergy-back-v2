import { auth, login, logout } from "@/controllers/auth.controller";
import catchAsync from "@/libs/catch-async";
import { isLoggedIn, isNotLoggedIn } from "@/middlewares/auth.guard";
import express from "express";

const router = express.Router();

router
  .route("/")
  .get(catchAsync(auth))
  .post(isNotLoggedIn, catchAsync(login))
  .delete(isLoggedIn, catchAsync(logout));

export default router;
