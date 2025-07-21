import { z } from "zod";

export const signUpFormSchema = z.object({
  firstName: z.string().min(1, "Username is required"),
  lastName: z.string().optional(),
  email: z.email("Invalid email").min(1, "Email is required"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  profileImage: z
    .instanceof(File)
    .refine((file) => file.type.startsWith("image/"), {
      message: "Must be an image file",
    })
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Image size must be less than 5MB",
    })
    .optional(),
});

export type signUpFormSchemaType = z.infer<typeof signUpFormSchema>;
