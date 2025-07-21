"use server";
import User from "@/models/user.model";
import { sendMail } from "@/helpers/nodeMailer";
import connectDB from "../connectDB";
import bcrypt from "bcryptjs";

export async function validateToken(token: string) {
  await connectDB();
  const user = await User.findOne({ verificationToken: token });
  if (!user) return false;
  return true;
}

export async function verifyUser(token: string) {
  try {
    await connectDB();
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new Error("Invalid Verification Token");
    }
    const isTokenExpired = user.verificationTokenExpires < Date.now();
    if (isTokenExpired) {
      return {
        error: "Verification Token Expired",
        type: "expired",
        success: false,
        status: 400,
      };
    }
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();
    return {
      message: "Email verified successfully",
      success: true,
      status: 200,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
        success: false,
        status: 400,
      };
    }
  }
}

export async function resendMail(token: string, type: "verification" | "reset") {
  try {
    await connectDB();
    let user;
    if (type === "verification") {
      user = await User.findOne({ verificationToken: token });
    } else {
      user = await User.findOne({ forgotPasswordToken: token });
    }
    if (!user) {
      throw new Error(`Invalid ${type} Token`);
    }
    let res
    if (type === "verification") {
      res = await sendMail(user.email, "verification", user._id);
    } else {
      res = await sendMail(user.email, "forgot_password", user._id);
    }
    if (!res) {
      throw new Error("error while sending mail");
    }
    return {
      message: "Email sent successfully",
      success: true,
      status: 200,
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
        success: false,
        status: 400,
      };
    }
  }
}

export async function validateResetToken(token: string) {
  await connectDB();
  const user = await User.findOne({ forgotPasswordToken: token });
  if (!user) return { isValid: false, success: false };
  if (user && user.forgotPasswordTokenExpires < Date.now())
    return { isValid: false, isExpired: true, success: false };
  return { isValid: true, success: true };
}

export async function updatePassword(token: string, newPassword: string) {
  try {
    await connectDB();
    const user = await User.findOne({ forgotPasswordToken: token });
    if (!user) {
      throw new Error("Invalid Reset Token");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordTokenExpires = undefined;
    await user.save();
    return { message: "Password updated successfully", success: true };
  } catch (error) {
    return { message: (error as Error).message, success: false };
  }
}
