import nodemailer from "nodemailer";
import { v4 as uuidv4 } from "uuid";
import User from "@/models/user.model";
import { verificationMailBody } from "@/helpers/verification-mail-body";
import { forgotMailBody } from "@/helpers/forgot-mail-body";

export const sendMail = async (
  email: string,
  type: "verification" | "forgot_password",
  userID: string
) => {
  try {
    let randomID = uuidv4();
    let user = await User.findOne({ verificationToken: randomID });
    while (user) {
      randomID = uuidv4();
      user = await User.findOne({ verificationToken: randomID });
    }
    const transporter = nodemailer.createTransport({
      host: process.env.NODEMAILER_TRANSPORT_HOST,
      port: 587,
      auth: {
        user: process.env.NODEMAILER_TRANSPORT_USER,
        pass: process.env.NODEMAILER_TRANSPORT_PASSWORD,
      },
    });
    await transporter.verify();
    if (type === "verification") {
      const user = await User.findByIdAndUpdate(
        userID,
        {
          verificationToken: randomID,
          verificationTokenExpires: Date.now() + 3600000,
        },
        { new: true }
      );
      if (!user) {
        throw new Error("User not found");
      }
      const mailOptions = {
        from: "noreply@example.com",
        to: email,
        subject: "Account Verification",
        html: verificationMailBody(randomID, new Date().getFullYear()),
      };
      const info = await transporter.sendMail(mailOptions);
      if (!info) {
        throw new Error("Verification email not sent");
      }
      return {user, info};
    } else if (type === "forgot_password") {
      const user = await User.findByIdAndUpdate(
        userID,
        {
          forgotPasswordToken: randomID,
          forgotPasswordTokenExpires: Date.now() + 3600000,
        },
        { new: true }
      );
      if (!user) {
        throw new Error("User not found");
      }
      const mailOptions = {
        from: "noreply@example.com",
        to: email,
        subject: "Reset Password",
        html: forgotMailBody(randomID, new Date().getFullYear()),
      };
      const info = await transporter.sendMail(mailOptions);
      if (!info) {
        throw new Error("Reset password email not sent");
      }
      return {user, info};
    }
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
  }
};
