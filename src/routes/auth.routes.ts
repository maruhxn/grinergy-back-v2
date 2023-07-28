import { validateAdmin } from "@/controller/auth.controller";
import catchAsync from "@/lib/catch-async";
import { isNotLoggedIn } from "@/middleware/authorization.middleware";
import express from "express";

const router = express.Router();

router.post("/validate-admin", isNotLoggedIn, catchAsync(validateAdmin));

export default router;
