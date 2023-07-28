import * as bcrypt from "bcrypt";
import mongoose from "mongoose";
const saltRounds = 12;

const UserSchema = new mongoose.Schema({
  userId: {
    type: String,
    unique: 1,
    required: true,
  },
  password: {
    type: String,
    minlength: 6,
    requried: true,
  },
  level: {
    type: Number,
    default: 0,
  },
});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  if (!this.password) return;
  this.password = await bcrypt.hash(this.password, saltRounds);
  next();
});

export const UserModel = mongoose.model("User", UserSchema);

export const getUsers = UserModel.find();
export const getUserById = (userId: string) => UserModel.findOne({ userId });
