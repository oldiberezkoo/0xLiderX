import gravatar from "@/utiles/gravatar.utils";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export interface UserDocument extends mongoose.Document {
  email: string;
  password: string;
  avatar: string;
  isActive: boolean;
  name: string;
  role: Role;
  refreshTokens: string[];
}
export const roles = {
  user: "user",
  admin: "admin",
  manager: "manager",
  guest: "guest",
  developer: "developer",
} as const;

export type Role = (typeof roles)[keyof typeof roles];

export const UserSchema = new mongoose.Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      required: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(roles),
      default: roles.guest,
      required: true,
    },
    refreshTokens: {
      type: [String],
      default: [],
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("avatar") && !user.avatar) {
    user.avatar = gravatar(user.email, 256);
  }

  if (!user.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  user.password = await bcrypt.hash(user.password, salt);

  next();
});
UserSchema.index({ refreshTokens: 1 }, { unique: true });
