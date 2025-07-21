"use client";
import Link from "next/link";
import React, { useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { generateRandomColor } from "@/helpers/random-colors";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { SquareBottomDashedScissors } from "lucide-react";
import { LogOut } from "lucide-react";
import { LoaderCircle } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

function Header({ pageTitle }: { pageTitle: string }) {
  const { data: session } = useSession();
  const path = usePathname();
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [isLogingOut, setIsLogingOut] = useState(false);
  const [confirmDeleteValue, setConfirmDeleteValue] = useState("");
  const [confirmationError, setConfirmationError] = useState<string | null>(
    null
  );
  const alertDialogActionRef = useRef<HTMLButtonElement | null>(null);
  const { backgroundColor, textColor } = useRef(generateRandomColor()).current;
  let firstChars: string[] = ["", ""];
  if (session?.user.name && typeof session?.user.name === "string") {
    firstChars = session?.user?.name?.split(" ");
  }
  const navigations = [
    {
      label: "Home",
      href: "/",
      isActive: !session?.user && path !== "/",
    },
    {
      label: "Sign In",
      href: "/login",
      isActive: !session?.user && path !== "/login",
    },
    {
      label: "Sign up",
      href: "/register",
      isActive: !session?.user && path !== "/register",
    },
  ];

  const deleteUser = async () => {
    try {
      if (confirmDeleteValue === session?.user?.name) {
        setIsDeletingUser(true);
        const response = await fetch(
          `/api/auth/delete?id=${session?.user?.id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error("Failed to delete user");
        }
        const data = await response.json();
        if (data.success) {
          setIsDeletingUser(false);
          alertDialogActionRef.current?.click();
          signOut({ callbackUrl: "/" });
        } else {
          throw new Error(data.message);
        }
      } else {
        throw new Error("Confirmation value does not match");
      }
    } catch (error) {
      setConfirmationError((error as Error).message);
      setIsDeletingUser(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-5">
      <h1 className="text-2xl text-wrap font-semibold">{pageTitle}</h1>
      <div className="flex items-center justify-end">
        {navigations.map((navigation) => (
          <Link
            href={navigation.href}
            key={navigation.href}
            className={`font-semibold text-slate-600 hover:text-slate-100 transition-colors px-4 ${
              navigation.isActive ? "block" : "hidden"
            }`}
          >
            {navigation.label}
          </Link>
        ))}

        {session?.user && (
          <AlertDialog>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="sm:size-8 md:size-10 lg:size-11 cursor-pointer">
                  <AvatarImage
                    src={session?.user?.image as string}
                    alt={session?.user?.name}
                  />
                  <AvatarFallback
                    style={{ backgroundColor, color: textColor }}
                    className="font-semibold text-[20px]"
                  >
                    {firstChars[0] && firstChars[0][0].toUpperCase()}
                    {firstChars[1] && firstChars[1][0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {path !== "/" && (
                    <Link href="/">
                      <DropdownMenuItem className="cursor-pointer">
                        Home
                        <DropdownMenuShortcut>
                          <SquareBottomDashedScissors className="opacity-80" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  {path !== "/snippets" && (
                    <Link href="/snippets">
                      <DropdownMenuItem className="cursor-pointer">
                        My Snippets
                        <DropdownMenuShortcut>
                          <SquareBottomDashedScissors className="opacity-80" />
                        </DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </Link>
                  )}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={async () => {
                      setIsLogingOut(true);
                      await signOut({ callbackUrl: "/login" });
                      setIsLogingOut(false);
                    }}
                  >
                    {isLogingOut ? (
                      <LoaderCircle className="animate-spin" />
                    ) : (
                      "Log Out"
                    )}
                    {!isLogingOut && (
                      <DropdownMenuShortcut>
                        <LogOut className="opacity-80" />
                      </DropdownMenuShortcut>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem className="text-red-500 focus:text-red-500 font-medium cursor-pointer">
                      {isDeletingUser ? (
                        <LoaderCircle className="animate-spin" />
                      ) : (
                        "Delete User"
                      )}
                      {!isDeletingUser && (
                        <DropdownMenuShortcut>
                          <Trash2 className="text-red-500 opacity-80" />
                        </DropdownMenuShortcut>
                      )}
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and your data. Write{" "}
                  <span className="font-semibold text-slate-800">{`"${session?.user?.name}"`}</span>{" "}
                  in the box below to confirm.
                  <Input
                    className="mt-3 border-slate-400 focus:border-none focus:ring-2 focus:ring-blue-500"
                    onChange={(e) => setConfirmDeleteValue(e.target.value)}
                  />
                  {confirmationError && (
                    <span className="text-red-500">{confirmationError}</span>
                  )}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="cursor-pointer">
                  Cancel
                </AlertDialogCancel>
                <Button
                  className="cursor-pointer bg-red-500 hover:bg-red-600 transition-colors duration-200 text-white gap-2"
                  onClick={() => deleteUser()}
                  >
                  {isDeletingUser ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    <>
                      Delete User
                      <Trash2 />
                    </>
                  )}
                </Button>
                <AlertDialogAction className="hidden" ref={alertDialogActionRef}></AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export default React.memo(Header);
