// eslint-disable-next-line @typescript-eslint/no-unused-vars
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
    interface User {
        id?: string;
        name: string;
        email: string;
        emailVerified: Date | null;
        image: string;
        password?: string;
        isVerified?: boolean;
        isAdmin?: boolean;
        verificationToken?: string;
        verificationTokenExpires?: number;
        forgotPasswordToken?: string;
        forgotPasswordTokenExpires?: number;
    }
    interface Session {
        user: {
            id?: string;
            name?: string;
            isAdmin?: boolean;
            isVerified?: boolean;
        } & DefaultSession["user"];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id?: string;
        name?: string;
        isAdmin?: boolean;
        isVerified?: boolean;
    }
}