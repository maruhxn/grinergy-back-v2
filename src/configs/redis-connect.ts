// import dotenv from "dotenv";
// import { createClient } from "redis";

// dotenv.config();
// export const redisClient = createClient({
//   url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}/0`,
// });

// function connectRedis() {
//   redisClient.on("connect", () => {
//     console.info("Redis connected!");
//   });
//   redisClient.on("error", (err: any) => {
//     console.error("Redis Client Error", err);
//   });

//   redisClient.connect();
//   return redisClient;
// }

// export default connectRedis;
