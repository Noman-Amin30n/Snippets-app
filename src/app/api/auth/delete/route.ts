import { NextRequest, NextResponse } from "next/server";
import User from "@/models/user.model";
import { userType } from "@/models/user.model";
import Account from "@/models/account.model";
import { Snippet } from "@/models/snippet.model";
import connectDB from "@/lib/connectDB";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    try {
        await connectDB();
        const user: userType | null = await User.findOne({ _id: id });
        if (user && user.password && user.image) {
            const response = await deleteFromCloudinary(user.image, "image");
            if (!response) {
                throw new Error("Error while deleting image from Cloud");
            }
            const deletedUser = await User.deleteOne({ _id: id });
            if (!deletedUser) {
                throw new Error("Error while deleting user");
            }
        } else if (user && !user.password) {
            const deletedUser = await User.deleteOne({ _id: id });
            if (!deletedUser) {
                throw new Error("Error while deleting user");
            }
        }
        if (!user) {
            throw new Error("User not found");
        }
        await Account.deleteMany({ userId: id });
        await Snippet.deleteMany({ userId: id });
        return NextResponse.json({ message: "User deleted successfully", success: true }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ message: (error as Error).message, success: false }, { status: 500 });
    }
}