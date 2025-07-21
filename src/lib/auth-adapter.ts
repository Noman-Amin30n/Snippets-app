import type { Adapter } from "next-auth/adapters";
import User from "../models/user.model";
import Account from "../models/account.model";
import VerificationToken from "../models/verificationToken.model";
import type { userType } from "../models/user.model";
import type { AccountType } from "../models/account.model";
import { authUser } from "@/helpers/mongo-id";
import connectDB from "@/lib/connectDB";

export function MongooseAdapter(): Adapter {
  return {
    async createUser(data: userType) {
      await connectDB();
      const user = await User.create(data);
      return authUser(user);
    },

    async getUser(id) {
      await connectDB();
      const user = await User.findById(id);
      if (!user) return null;
      return authUser(user);
    },

    async getUserByEmail(email) {
      await connectDB();
      const user = await User.findOne({ email });
      if (!user) return null;
      return authUser(user);
    },

    async getUserByAccount({ provider, providerAccountId }) {
      await connectDB();
      const account = await Account.findOne({ provider, providerAccountId });
      if (!account) return null;
      const user = await User.findById(account.userId);
      if (!user) return null;
      return authUser(user);
    },

    async updateUser(user) {
      await connectDB();
      await User.findByIdAndUpdate(user.id, user);
      const updatedUser = await User.findById(user.id);
      if (!updatedUser) return null;
      return authUser(updatedUser);
    },

    async deleteUser(userId) {
      await connectDB();
      await User.findByIdAndDelete(userId);
      await Account.deleteMany({ userId });
    },

    async linkAccount(account: AccountType) {
      await connectDB();
      await Account.create(account);
      return account;
    },

    async unlinkAccount({ provider, providerAccountId }: { provider: string; providerAccountId: string }) {
      await connectDB();
      await Account.deleteOne({ provider, providerAccountId });
    },

    async createVerificationToken(token) {
      await connectDB();
      await VerificationToken.create(token);
      return token;
    },

    async useVerificationToken({ identifier, token }) {
      await connectDB();
      const vt = await VerificationToken.findOneAndDelete({ identifier, token });
      return vt?.toObject() || null;
    },
  };
}

export default MongooseAdapter;