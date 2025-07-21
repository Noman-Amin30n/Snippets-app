import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import { parseFormData } from "@/lib/parseFormData";
import { signUpFormSchema, type signUpFormSchemaType } from "@/lib/validation";
import connectDB from "@/lib/connectDB";
import { sendMail } from "@/helpers/nodeMailer";
import bcrypt from "bcryptjs";
import cloudinary from "@/lib/cloudinary";
import streamifier from "streamifier";
import { UploadApiResponse } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const formData = await req.formData();
    const parsed = await parseFormData<signUpFormSchemaType>(formData);
    const validation = signUpFormSchema.safeParse(parsed);
    if (!validation.success) {
      throw new Error(validation.error.message);
    }
    const { firstName, lastName, email, password, profileImage } =
      validation.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("User already exists");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let cloudinaryUrl: string | undefined;
    if (profileImage) {
      const buffer = Buffer.from(await profileImage.arrayBuffer());
      const uploadResult: UploadApiResponse = await new Promise(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "user_avatars" },
            (err, result) => {
              if (err || !result) {
                reject(err);
                return;
              };
              resolve(result);
            }
          );
          streamifier.createReadStream(buffer as Buffer).pipe(stream);
        }
      );
      cloudinaryUrl = uploadResult.secure_url;
    }

    const userCreated = await User.create({
      name: lastName ? `${firstName} ${lastName}` : firstName,
      image: cloudinaryUrl || "",
      email,
      password: hashedPassword,
      isVerified: false,
      isAdmin: false,
    });
    if (!userCreated) {
      throw new Error("User not created");
    }
    const res = await sendMail(
      userCreated.email,
      "verification",
      userCreated._id
    );
    if (!res) {
      throw new Error("error while sending mail");
    }
    return NextResponse.json({ message: "User created successfully", user: userCreated, success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ message: error.message, success: false }, { status: 400 });
    }
  }
}
