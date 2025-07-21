import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import connectDB from "@/lib/connectDB";
import { sendMail } from "@/helpers/nodeMailer";

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email } = await req.json();
        const user = await User.findOne({ email });
        if (!user || !user.password) {
            throw new Error("Invalid email");
        }
        if (user.forgotPasswordTokenExpires && user.forgotPasswordTokenExpires >= Date.now()) {
            return NextResponse.json({ message: "Check your inbox", success: true }, { status: 200 });
        }
        const res = await sendMail(user.email, "forgot_password", user._id);
        if (!res) {
            throw new Error("Error while sending forgot password email");
        }
        return NextResponse.json({ message: "We've sent an email to reset your password, check your inbox", success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, success: false }, { status: 500 });
    }
}