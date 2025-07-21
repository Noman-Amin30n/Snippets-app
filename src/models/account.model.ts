import { Schema, Document, Types, models, model } from "mongoose";

export interface AccountType extends Document {
    userId: Types.ObjectId;
    type: string;
    provider: string;
    providerAccountId: string;
    refresh_token: string;
    access_token: string;
    expires_at: number;
    token_type: string;
    scope: string;
    id_token: string;
    session_state: string;
}

const accountSchema = new Schema<AccountType>({
  userId: { type: Schema.Types.ObjectId, ref: "User" },
  type: String,
  provider: String,
  providerAccountId: String,
  refresh_token: String,
  access_token: String,
  expires_at: Number,
  token_type: String,
  scope: String,
  id_token: String,
  session_state: String,
});

export default models.Account || model("Account", accountSchema);
