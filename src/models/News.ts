import { INews } from "@/types/news";
import { model, Schema } from "mongoose";

const FileSchema = new Schema({
  filePath: {
    type: String,
    required: true,
  },
  fileName: {
    type: String,
    required: true,
  },
});

const NewsSchema = new Schema<INews>(
  {
    image: FileSchema,
    title: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    contents: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<INews>("News", NewsSchema);
