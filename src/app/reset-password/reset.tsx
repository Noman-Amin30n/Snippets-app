"use client";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useSearchParams } from "next/navigation";
import { validateResetToken, resendMail } from "@/lib/actions/auth.action";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { updatePassword } from "@/lib/actions/auth.action";
import Link from "next/link";

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isResendingMail, setIsResendingMail] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  useEffect(() => {
    (async () => {
      const response = await validateResetToken(token as string);
      if (response.isValid) {
        setIsValidToken(true);
      } else if (!response.isValid && response.isExpired) {
        setIsTokenExpired(true);
      }
      setIsValidatingToken(false);
    })();
  }, [token]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
  } = useForm<FormData>({
    mode: "onChange",
  });

  const handleResetPassword = async (data: FormData) => {
    try {
      setServerError(null);
      setSuccessMessage(null);
      setIsSuccessful(false);
      const response = await updatePassword(token as string, data.newPassword);
      if (response.success) {
        setSuccessMessage(response.message);
        setIsSuccessful(true);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setServerError(error instanceof Error ? error.message : null);
    }
  };
  const handleResendMail = async () => {
    setIsResendingMail(true);
    const response = await resendMail(token, "reset");
    setIsResendingMail(false);
    if (response && response.error) {
      setServerError(response.error);
    } else if (response && response.message) {
      setSuccessMessage(response.message);
      setServerError(null);
    }
  };
  return (
    <div className="min-h-[calc(100vh-64px)] flex justify-center items-center">
      <div className="flex flex-col justify-center items-stretch gap-4 bg-white rounded-md p-5 min-w-[300px] max-w-[400px] w-full">
        <h1 className="text-center font-semibold text-2xl md:text-3xl lg:text-4xl text-green-800">
          Reset Password
        </h1>
        {isValidatingToken ? (
          <div className="flex justify-center items-center">
            <LoaderCircle className="animate-spin" size={64} />
          </div>
        ) : (
          <>
            {isValidToken && !isTokenExpired && !isSuccessful && (
              <form
                className="flex flex-col justify-start items-stretch gap-4"
                onSubmit={handleSubmit(handleResetPassword)}
              >
                <div>
                  <label htmlFor="password" className="block">
                    New Password
                  </label>
                  <input
                    className="border p-2 w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm"
                    type="password"
                    disabled={isSubmitting}
                    {...register("newPassword", {
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
                          !/\s/.test(value) ||
                          "Password must not contain spaces",
                      },
                    })}
                  />
                  {errors.newPassword && (
                    <span className="text-red-500 text-sm">
                      {errors.newPassword.message}
                    </span>
                  )}
                </div>
                <div>
                  <label htmlFor="confirmPassword" className="block">
                    Confirm Password
                  </label>
                  <input
                    className="border p-2 w-full border-slate-300 focus:ring focus:ring-blue-500 focus:ring-inset focus:outline-none focus:border-blue-500 rounded-sm"
                    type="password"
                    disabled={isSubmitting}
                    {...register("confirmPassword", {
                      validate: (value) =>
                        value === getValues("newPassword") ||
                        "Passwords do not match",
                    })}
                  />
                  {errors.confirmPassword && (
                    <span className="text-red-500 text-sm">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer flex justify-center items-center"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </form>
            )}
            {!isValidToken && !isTokenExpired && (
              <p className="text-red-500 text-center">Invalid Link</p>
            )}
            {!isValidToken && isTokenExpired && (
              <>
                <p className="text-red-500 text-center leading-snug">
                  Link Expired
                </p>
                <Button
                  className="text-sm cursor-pointer bg-blue-500 text-white hover:bg-blue-600 transition-colors self-center"
                  onClick={handleResendMail}
                >
                  {isResendingMail ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Resend Mail"
                  )}
                </Button>
              </>
            )}
            {isSuccessful && (
              <Link href="/login" className="self-center">
                <Button className="text-sm cursor-pointer bg-blue-500 text-white hover:bg-blue-600 transition-colors">
                  Go to Login
                </Button>
              </Link>
            )}
          </>
        )}
        {successMessage && (
          <p className="text-green-500 text-center">{successMessage}</p>
        )}
        {serverError && <p className="text-red-500">{serverError}</p>}
      </div>
    </div>
  );
}

export default ResetPassword;