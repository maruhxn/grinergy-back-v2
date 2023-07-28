import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import ExpressMongoSanitize from "express-mongo-sanitize";
import expressSession from "express-session";
import helmet from "helmet";
import hpp from "hpp";
import http from "http";
// import "module-alias/register";
import morgan from "morgan";
import path from "path";
// import "tsconfig-paths/register";

import connect from "@/db";
import { authRouter } from "./routes";

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
      origin: /grinergy\.tech$/,
      credentials: true,
    })
  );
} else {
  app.use(morgan("dev"));
  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );
}

app.use(morgan("dev"));
app.use(compression());
app.use(express.static(path.join(__dirname, "public")));
// app.use("/img", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(ExpressMongoSanitize());
app.use(cookieParser(process.env.COOKIE_SECRET || "null"));
app.use(
  expressSession({
    resave: false,
    saveUninitialized: false,
    name: process.env.COOKIE_NAME || "SSID",
    secret: process.env.COOKIE_SECRET || "secret",
    proxy: true,
    cookie: {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7,
      secure: isProd, // https -> true
      domain: isProd ? ".grinergy.tech" : undefined,
    },
  })
);

app.use("/auth", authRouter);

const server = http.createServer(app);

server.listen(app.get("port"), async () => {
  await connect();
  console.log(
    `⚡️[server]: Server is running at http://localhost:${app.get("port")}`
  );
});
