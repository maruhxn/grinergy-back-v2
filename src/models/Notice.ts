import { INotice } from "@/types/notice";
import { Schema, model } from "mongoose";

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

const NoticeSchema = new Schema<INotice>(
  {
    title: {
      type: String,
      required: true,
    },
    contents: {
      type: String,
      required: true,
    },
    files: [
      {
        type: FileSchema,
        required: false,
      },
    ],
  },
  { timestamps: true }
);

export default model<INotice>("Notice", NoticeSchema);
