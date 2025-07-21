import { Schema, model, models, Document } from 'mongoose';

interface VerificationTokenType extends Document {
  identifier: string;
  token: string;
  expires: Date;
}

const VerificationTokenSchema = new Schema<VerificationTokenType>({
  identifier: String,
  token: { type: String, unique: true },
  expires: Date,
});

export default models.VerificationToken || model<VerificationTokenType>(
  'VerificationToken',
  VerificationTokenSchema
);