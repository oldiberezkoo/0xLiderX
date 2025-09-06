import type mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  avatar: string;
  isActive: boolean;
  name: string;
  role: string;
}

