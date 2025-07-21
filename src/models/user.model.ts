import { Schema, Document, models, model } from "mongoose";

export interface userType extends Document {
  name: string;
  email: string;
  emailVerified?: Date | null;
  image?: string;
  password?: string;
  isVerified?: boolean;
  isAdmin?: boolean;
  verificationToken?: string;
  verificationTokenExpires?: number;
  forgotPasswordToken?: string;
  forgotPasswordTokenExpires?: number;
}

const userSchema = new Schema<userType>({
  name: { type: String, default: "" },
  email: { type: String, unique: true },
  emailVerified: { type: Date, default: null },
  image: { type: String, default: "" },
  password: { type: String, default: "" },
  isVerified: { type: Boolean, default: false },
  isAdmin: { type: Boolean, default: false },
  verificationToken: { type: String, default: undefined, sparse: true },
  verificationTokenExpires: { type: Number, default: undefined, sparse: true },
  forgotPasswordToken: { type: String, default: undefined, sparse: true },
  forgotPasswordTokenExpires: {
    type: Number,
    default: undefined,
    sparse: true,
  },
});

export default models.User || model("User", userSchema);
