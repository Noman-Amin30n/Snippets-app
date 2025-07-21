"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRef } from "react";
import { X } from "lucide-react";
import Header from "@/components/header";

type FormData = {
  firstName: string;
  lastName: string | undefined;
  email: string;
  password: string;
  profileImage: File | null;
};

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isSucceeded, setIsSucceeded] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const profileImageRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  const removeProfileImage = () => {
    if (profileImageRef) {
      profileImageRef.current!.value = "";
      setProfileImage(null);
    }
  };

  const onSubmit = async (data: FormData) => {
    try {
      setServerError(null);
      setIsSucceeded(false);
      const formData = new FormData();
      formData.append("firstName", data.firstName);
      formData.append("lastName", data.lastName || "");
      formData.append("email", data.email);
      formData.append("password", data.password);
      if (profileImage) formData.append("profileImage", profileImage);
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Error while registering user");
      }
      const result = await res.json();
      if (result.success) {
        setIsSucceeded(true);
        setServerError(null);
        setProfileImage(null);
        reset();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      if (error instanceof Error) {
        setServerError(error.message);
      }
    }
  };

  const googleSignIn = async () => {
    setIsGoogleSigningIn(true);
    const res = await signIn("google", {
      redirect: false,
      callbackUrl: "/snippets",
    });
    setIsGoogleSigningIn(false);
    if (res?.error) {
      setServerError(res.error);
    } else if (res?.ok && res.url) {
      router.push(res.url);
    }
  };

  return (
    <div className="flex flex-col items-stretch justify-start min-h-[calc(100vh-64px)]">
      <Header pageTitle="Sign Up"/>
      <div className="grow flex justify-center items-center">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="min-w-[300px] max-w-[400px] w-full bg-white p-5 mx-5 flex flex-col justify-start items-stretch gap-4 rounded-md"
        >
          <h1 className="text-center font-semibold text-2xl md:text-3xl lg:text-4xl text-green-800 mb-2">
            Sign Up
          </h1>
          {serverError && (
            <p className="text-red-500 text-center">{serverError}</p>
          )}
          {isSucceeded && (
            <p className="text-green-500 text-center">
              Registration successful. Please check your email to verify your
              account
            </p>
          )}
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <label className="block text-sm font-medium">
                First Name<span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                disabled={isSubmitting}
                {...register("firstName", {
                  required: "First name is required",
                })}
                className="border p-2 w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm"
              />
              {errors.firstName && (
                <p className="text-red-500 text-sm">
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium">Last Name</label>
              <input
                type="text"
                {...register("lastName")}
                disabled={isSubmitting}
                className="border p-2 w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm"
              />
              {errors.lastName && (
                <p className="text-red-500 text-sm">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">
              Email<span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              disabled={isSubmitting}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Enter a valid email address",
                },
                maxLength: {
                  value: 320,
                  message: "Email is too long",
                },
              })}
              className="border p-2 w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm">{errors.lastName.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">
              Password<span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              disabled={isSubmitting}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters long",
                },
                pattern: {
                  value:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-]).{8,}$/,
                  message:
                    "Password must include uppercase, lowercase, number, and special character",
                },
                validate: {
                  noSpaces: (value) =>
                    !/\s/.test(value) || "Password must not contain spaces",
                },
              })}
              className="border p-2 w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm"
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <div>
            {profileImage && (
              <div className="relative w-[100px] h-[100px] border border-slate-300 rounded-md">
                <Image
                  src={URL.createObjectURL(profileImage)}
                  alt="profile"
                  fill
                  className="object-contain object-center"
                />
                <span
                  className="absolute -right-4 cursor-pointer text-red-500"
                  onClick={removeProfileImage}
                >
                  <X size={16} />
                </span>
              </div>
            )}
            <div className="grid w-full max-w-sm items-center gap-3">
              <Label>Profile Picture</Label>
              <Input
                type="file"
                disabled={isSubmitting}
                {...register("profileImage")}
                onChange={(e) => setProfileImage(e.target.files?.[0] || null)}
                accept="image/*"
                ref={profileImageRef}
                className="border w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm cursor-pointer"
              />
            </div>
          </div>
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer flex justify-center items-center"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              "Sign Up"
            )}
          </button>
          {serverError && <p className="text-red-600 text-sm">{serverError}</p>}
          <hr />

          <button
            type="button"
            onClick={googleSignIn}
            disabled={isGoogleSigningIn}
            className="bg-white text-slate-800 border border-green-900 px-4 py-2 rounded cursor-pointer text-center font-medium flex justify-center items-center gap-2"
          >
            {isGoogleSigningIn ? (
              <LoaderCircle className="animate-spin" />
            ) : (
              <>
                <Image
                  src="/google_logo.png"
                  alt="Google Logo"
                  width={20}
                  height={20}
                />
                <span>Sign Up with Google</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
