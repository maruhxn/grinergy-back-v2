import { auth, login } from "@/controllers/auth.controller";
import catchAsync from "@/libs/catch-async";
import { isNotLoggedIn } from "@/middlewares/auth.guard";
import express from "express";

const router = express.Router();

router.route("/").post(isNotLoggedIn, catchAsync(login)).get(auth);

export default router;
