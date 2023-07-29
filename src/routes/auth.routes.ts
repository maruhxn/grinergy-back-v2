import { auth, validateAdmin } from "@/controllers/auth.controller";
import catchAsync from "@/libs/catch-async";
import { isNotLoggedIn } from "@/middlewares/auth.guard";
import express from "express";

const router = express.Router();

router.get("/", catchAsync(auth));
router.post("/login", isNotLoggedIn, catchAsync(validateAdmin));

export default router;
