import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import MongooseAdapter from "@/lib/auth-adapter";
import connectDB from "@/lib/connectDB";
import bcrypt from "bcryptjs";
import User from "@/models/user.model";
import { authUser } from "@/helpers/mongo-id";
import { sendMail } from "@/helpers/nodeMailer";

interface Credentials {
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  adapter: MongooseAdapter(),
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "email", type: "email" },
        password: { label: "password", type: "password" },
      },
      async authorize(
        credentials: Record<"email" | "password", string> | undefined
      ) {
        await connectDB();
        const { email, password } = (credentials as Credentials) ?? {};
        if (!email || !password) {
          throw new Error("Email and password are required");
        }
        const user = await User.findOne({ email });
        if (!user) {
          throw new Error("User with this email doesn't exist");
        }
        const isValid =
          credentials &&
          (await bcrypt.compare(password, user.password));
        if (!isValid) {
          throw new Error("Invalid password");
        }
        if (!user.isVerified) {
          if (user.verificationTokenExpires < Date.now()) {
            await sendMail(user.email, "verification", user._id);
          }
          throw new Error("You need to verify your email. Check your inbox.");
        }
        return authUser(user);
      },
    }),
    GoogleProvider({
      id: "google",
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    })
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.isAdmin = user.isAdmin;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.isAdmin = token.isAdmin;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  jwt: {
    maxAge: 60 * 60 * 24,
  },
  events: {
    createUser: async ({ user }) => {
      if (!user.password) {
        await User.findByIdAndUpdate(user.id, { isVerified: true });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
