"use client";
import Header from "@/components/header";
import Main from "@/components/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useTransition, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { update } from "@/lib/actions/snippet.action";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface fieldTypes {
  title: string;
  description: string;
  code: string;
}

const supportedLanguages = [
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "HTML", value: "html" },
  { label: "CSS", value: "css" },
  { label: "JSON", value: "json" },
  { label: "Markdown", value: "markdown" },
  { label: "Java", value: "java" },
  { label: "C++", value: "cpp" },
];

function EditForm({ id, snippet }: { id: string; snippet: fieldTypes }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = useState<undefined | string>(undefined);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    watch,
  } = useForm<fieldTypes>({
    mode: "onChange",
    defaultValues: snippet,
  });
  const { title: titleValue, description: descriptionValue } = watch();
  const updateSnippet = async (data: fieldTypes) => {
    startTransition(async () => {
      await update(id, data);
    });
    reset({ title: "", description: "", code: "" });
    router.push(`/snippets/${id}`);
  };
  return (
    <>
      <Header pageTitle="Edit Snippet" />
      <Main>
        <h1 className="text-2xl font-bold">{snippet.title}</h1>
        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(updateSnippet)}
        >
          <div className="flex justify-end items-stretch">
            <Button
              className="text-sm cursor-pointer bg-orange-400 text-white hover:bg-orange-500 transition-colors"
              type="submit"
              disabled={isPending}
            >
              {isPending || isSubmitting ? (
                <span className="flex items-center">
                  <LoaderCircle className="animate-spin mr-1" />
                  Saving
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <Input
                placeholder="Title"
                {...register("title", {
                  required: { value: true, message: "Title is required" },
                  minLength: {
                    value: 10,
                    message: "Title must be at least 10 characters long",
                  },
                  maxLength: {
                    value: 100,
                    message: "Title should not exceed 100 characters",
                  },
                  validate: {
                    noSpecialChars: (value) =>
                      /^[a-zA-Z0-9\s]+$/.test(value) ||
                      "Title should not contain special characters",
                  },
                })}
              />
              {errors.title ? (
                <span className="text-red-500 text-sm">
                  {errors.title.message}
                </span>
              ) : (
                titleValue && (
                  <span className="text-green-800 text-sm">title is valid</span>
                )
              )}
            </div>

            <div>
              <Textarea
                placeholder="Description"
                className={`placeholder:text-gray-600 ${!descriptionValue ? "border-gray-600" : "border-green-800"}`}
                rows={3}
                {...register("description")}
              />
              {errors.description && (
                <span className="text-red-500 text-sm">
                  {errors.description.message}
                </span>
              )}
            </div>

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="border-gray-600 placeholder:text-blue-600">
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {supportedLanguages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Controller
              name="code"
              control={control}
              rules={{
                required: { value: true, message: "Code is required" },
                minLength: {
                  value: 10,
                  message: "Code must be at least 10 characters long",
                },
              }}
              render={({ field }) => (
                <Editor
                  height="300px"
                  defaultLanguage={language}
                  defaultValue="// Write your code here"
                  onChange={(value) => field.onChange(value || "")}
                  value={field.value}
                  theme="vs-dark"
                  options={{
                    readOnly: !language ? true : false,
                  }}
                />
              )}
            />
            {errors.code && (
              <span className="text-red-500 text-sm">
                {errors.code.message}
              </span>
            )}
          </div>
        </form>
      </Main>
    </>
  );
}

export default EditForm;
