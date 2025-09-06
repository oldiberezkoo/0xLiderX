import type mongoose from "mongoose";

export interface ActionDocument extends mongoose.Document {
  id: string;
  actionName: string;
  actionType: string;
  timestamp: Date;
  _id: string;
}
