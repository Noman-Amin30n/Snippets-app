"use server";
import { Snippet } from "@/models/snippet.model";
import connectDB from "../connectDB";
import mongoose from "mongoose";

export async function getSnippets(page: number = 1, limit: number = 10, userId: string) {
  try {
    await connectDB();
    const pipeLine = [
      { $match: {userId: new mongoose.Types.ObjectId(userId)} },
      { $sort: { createdAt: -1 as const } },
      {
        $addFields: {
          createdAt: {
            $dateToString: { format: "%Y-%m-%d %H:%M:%S", date: "$createdAt" },
          },
        },
      },
      { $project: { _id: 1, title: 1, description: 1, code: 1, createdAt: 1 } },
    ];
    const paginatedSnippets = await Snippet.aggregatePaginate(pipeLine, {
      page: page,
      limit: limit,
      customLabels: {
        totalDocs: "totalSnippets",
        docs: "snippets",
      },
    });
    if (!paginatedSnippets) {
      throw new Error("Error while fetching snippets: No snippets found");
    }
    return paginatedSnippets;
  } catch (error) {
    console.error(error);
  }
}

export async function getSnippetById(id: string) {
  try {
    await connectDB();
    const snippet = await Snippet.findById(id);
    if (!snippet) {
      throw new Error("Snippet not found");
    }
    return snippet;
  } catch (error) {
    console.error("Error fetching snippet:", error);
    throw new Error("Failed to fetch snippet");
  }
}

export async function createSnippet(data: {
  userId: string;
  title: string;
  description: string;
  code: string;
}) {
  try {
    await connectDB();
    const snippet = await Snippet.create({
      title: data.title,
      description: data.description,
      code: data.code,
      userId: data.userId
    });
    return snippet;
  } catch (error) {
    console.error("Error creating snippet:", error);
    throw new Error("Failed to create snippet");
  }
}

export async function update(
  id: string,
  data: { title: string; description: string; code: string }
) {
  try {
    await connectDB();
    const snippet = await Snippet.findByIdAndUpdate(id, data, {
      new: true,
    });
    if (!snippet) {
      throw new Error("Snippet not found");
    }
    return snippet;
  } catch (error) {
    console.error("Error updating snippet:", error);
    throw new Error("Failed to update snippet");
  }
}

export async function deleteSnippet(id: string) {
  try {
    await connectDB();
    const snippet = await Snippet.findByIdAndDelete(id);
    if (!snippet) {
      throw new Error("Snippet not found");
    }
    return snippet;
  } catch (error) {
    console.error("Error deleting snippet:", error);
    throw new Error("Failed to delete snippet");
  }
}
