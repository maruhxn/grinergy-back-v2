import mongoose from "mongoose";
const Schema = mongoose.Schema;

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

const NewsSchema = new Schema(
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

export default mongoose.model("News", NewsSchema);
