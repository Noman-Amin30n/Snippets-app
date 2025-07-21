"use client";

import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import Image from "next/image";

type FormData = {
  email: string;
  password: string;
};

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>();

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isSendingForgotPassword, setIsSendingForgotPassword] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/snippets";
  const router = useRouter();

  const onSubmit = async (data: FormData) => {
    setServerError(null);
    setSuccessMessage(null);
    const res = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
      callbackUrl,
    });

    if (res?.error) {
      setServerError(res.error);
    } else if (res?.ok && res.url) {
      router.push(res.url);
    }
  };

  const googleSignIn = async () => {
    setIsGoogleSigningIn(true);
    setServerError(null);
    setSuccessMessage(null);
    const res = await signIn("google", {
      redirect: false,
      callbackUrl,
    });
    setIsGoogleSigningIn(false);
    if (res?.error) {
      setServerError(res.error);
    } else if (res?.ok && res.url) {
      router.push(res.url);
    }
  };

  const handleForgotPassword = async () => {
    try {
      setIsSendingForgotPassword(true);
      const email = getValues("email");
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      const result = await res.json();
      if (result.success) {
        setServerError(null);
        setSuccessMessage(result.message);
        setIsSendingForgotPassword(false);
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      setServerError((error as Error).message);
      setIsSendingForgotPassword(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-128px)]">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="min-w-[300px] max-w-[400px] w-full bg-white p-5 mx-5 flex flex-col justify-start items-stretch gap-4 rounded-md"
      >
        <h1 className="text-center font-semibold text-2xl md:text-3xl lg:text-4xl text-green-800 mb-2">
          Sign In
        </h1>
        {serverError && (
          <p className="text-red-500 text-center">{serverError}</p>
        )}
        {successMessage && (
          <p className="text-green-500 text-center">{successMessage}</p>
        )}
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="text"
            {...register("email", { required: "Username is required" })}
            className="border p-2 w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Password</label>
          <input
            type="password"
            {...register("password", { required: "Password is required" })}
            className="border p-2 w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
          <span
            className="text-sm text-blue-600 cursor-pointer"
            onClick={handleForgotPassword}
          >
            {isSendingForgotPassword ? (
              <LoaderCircle className="animate-spin" size={16} />
            ) : (
              "Forgot Password?"
            )}
          </span>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer flex justify-center items-center"
          disabled={isSubmitting}
          onClick={() => {
            setServerError(null);
            setSuccessMessage(null);
          }}
        >
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : "Sign In"}
        </button>
        <hr />
        <button
          type="button"
          onClick={googleSignIn}
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
              <span>Sign In with Google</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
