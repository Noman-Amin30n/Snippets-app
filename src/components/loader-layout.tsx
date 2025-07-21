"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LoaderCircle } from "lucide-react";

function LoaderLayout({ children }: { children: React.ReactNode }) {
  const [authstate, setAuthstate] = useState<string | null>(null);
  const { status } = useSession();
  const [isPending, setIsPending] = useState(true);
  useEffect(() => {
    if (status !== "loading") {
      setIsPending(false);
      setAuthstate(status);
    }
  }, [status]);
  return (
    <>
      {isPending ? (
        <div className="flex items-center justify-center min-h-[calc(100vh-64px)]">
          <LoaderCircle className="animate-spin" size={64} color="#3b82f6"/>
        </div>
      ) : authstate !== "loading" && (
        <>
          {children}
        </>
      )}
    </>
  );
}

export default LoaderLayout;
