"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  verifyUser,
  resendMail,
  validateToken,
} from "@/lib/actions/auth.action";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";

function Verify() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInvalidToken, setIsInvalidToken] = useState(false);
  const [isTokenExpired, setIsTokenExpired] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const token = searchParams.get("token") || "";

  useEffect(() => {
    ;(async () => {
      const response = await validateToken(token as string);
      if (response === false) {
        setIsInvalidToken(true);
      }
      setIsPending(false);
    })()
  }, [token]);

  const handleVerification = async () => {
    setIsVerifying(true);
    const response = await verifyUser(token as string);
    setIsVerifying(false);
    if (response && response.error) {
      setError(response.error);
      if (response.type === "expired") {
        setIsTokenExpired(true);
      }
    } else if (response && response.success && response.message) {
      setError(null);
      setIsTokenExpired(false);
      setIsVerified(true);
      setSuccessMessage(response.message);
    }
  };
  const handleSendingMail = async () => {
    setIsResending(true);
    const response = await resendMail(token, "verification");
    setIsResending(false);
    if (response && response.error) {
      setError(response.error);
    }
  };
  return (
    <div className="min-h-screen w-full flex justify-center items-center">
      <div className="p-5 bg-white rounded-2xl flex flex-col justify-center items-center gap-5">
        {isPending ? (
          <LoaderCircle className="animate-spin" size={64} strokeWidth={1}/>
        ) : (
          <>
            {!isVerified && !isInvalidToken && (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold flex">
                    Verify your email
                  </h3>
                  <Mail size={32} color="rgb(34,197,94)" />
                </div>
                <div className="flex flex-col justify-center items-center gap-2">
                  <Button
                    className="text-sm cursor-pointer bg-green-500 text-white hover:bg-green-600 transition-colors"
                    onClick={handleVerification}
                    disabled={isVerifying}
                  >
                    {isVerifying ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Verify"
                    )}
                  </Button>
                  {isTokenExpired && (
                    <Button
                      className="text-sm cursor-pointer bg-gray-800 text-white hover:bg-gray-900 transition-colors"
                      onClick={handleSendingMail}
                      disabled={isResending}
                    >
                      {isResending ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        "Resend Mail"
                      )}
                    </Button>
                  )}
                  {error && <p className="text-red-500 text-sm">{error}</p>}
                </div>
              </>
            )}
            {isVerified && !isInvalidToken && (
              <>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold flex">
                    Email verified
                  </h3>
                  <Mail size={32} color="rgb(34,197,94)" />
                </div>
                <p className="text-sm text-green-500">{successMessage}</p>
                <Button
                  className="text-sm cursor-pointer bg-gray-800 text-white hover:bg-gray-900 transition-colors"
                  onClick={() => router.push("/login")}
                >
                  Go to Login
                </Button>
              </>
            )}
            {isInvalidToken && <Error />}
          </>
        )}
      </div>
    </div>
  );
}

function Error() {
  return (
    <>
      <h3 className="text-2xl font-semibold flex gap-2">
        Verify your email
        <Mail size={32} color="rgb(34,197,94)" />
      </h3>
      <p className="text-red-500 text-sm">Invalid token</p>
    </>
  );
}

export default Verify;
