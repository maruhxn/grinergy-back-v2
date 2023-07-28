import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

mongoose.set("strictQuery", true);
async function connect() {
  try {
    await mongoose.connect(process.env.MONGO_URL as string);
    console.log("🚀 Connected to DB");
  } catch (error) {
    console.log("❌ DB Error", error);
    process.exit(1);
  }
}

export default connect;
