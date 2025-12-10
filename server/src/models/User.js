import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    name: { type: String },
    applicantId: { type: String, default: null },
  },
  { timestamps: true }
);

const User = mongoose.model("User", UserSchema);
export default User;
