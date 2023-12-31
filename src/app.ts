import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express, NextFunction, Request, Response } from "express";
import ExpressMongoSanitize from "express-mongo-sanitize";
import helmet from "helmet";
import hpp from "hpp";
import http from "http";
import morgan from "morgan";
import path from "path";

import connect from "@/configs/db";
import HttpException from "@/libs/http-exception";
import ErrorFilter from "@/middlewares/error.filter";
import { authRouter, newsRouter, noticeRouter, searchRouter } from "@/routes";
import upload from "./middlewares/multer";

dotenv.config();

const app: Express = express();

const isProd: boolean = process.env.NODE_ENV === "production";

app.set("port", process.env.PORT || 8000);
app.set("trust proxy", true);

/* CONFIG */
if (isProd) {
  app.use(hpp());
  app.use(helmet());
  app.use(morgan("combined"));
  app.use(
    cors({
      // origin: /grinergy\.tech$/,
      origin: "*",
      credentials: true,
    })
  );
} else {
  app.use(morgan("dev"));
  app.use(cors());
}

app.use(morgan("dev"));
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());

app.post("/test", upload.single("image"), async (req, res, next) => {
  try {
    console.log(req.file);
    res.status(200).json({ result: "ok" });
  } catch (error) {
    next(error);
  }
});

app.use("/auth", authRouter);
app.use("/notice", noticeRouter);
app.use("/news", newsRouter);
app.use("/search", searchRouter);

app.use((req: Request, res: Response, next: NextFunction) => {
  const error = new HttpException(
    `${req.method} ${req.url} 라우터가 없습니다.`,
    404
  );
  next(error);
});

app.use(ErrorFilter);

const server = http.createServer(app);

server.listen(app.get("port"), async () => {
  await connect();
  console.log(
    `⚡️[server]: Server is running at http://localhost:${app.get("port")}`
  );
});
