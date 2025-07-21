import {
  Schema,
  model,
  models,
  Document,
  AggregatePaginateModel,
  ObjectId,
} from "mongoose";
import aggregatePaginate from "mongoose-aggregate-paginate-v2";

export interface SnippetType extends Document {
  title: string;
  description?: string;
  code: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const snippetSchema = new Schema<SnippetType>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      required: true,
      trim: true,
    },
    userId: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    }
  },
  { timestamps: true }
);

snippetSchema.plugin(aggregatePaginate);

export const Snippet =
  (models.Snippet as AggregatePaginateModel<SnippetType>) ||
  model<SnippetType, AggregatePaginateModel<SnippetType>>(
    "Snippet",
    snippetSchema
  );
