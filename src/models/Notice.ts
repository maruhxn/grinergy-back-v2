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

const NoticeSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    contents: {
      type: String,
      required: true,
    },
    files: [FileSchema],
  },
  { timestamps: true }
);

export default mongoose.model("Notice", NoticeSchema);
