"use client";
import Header from "@/components/header";
import Main from "@/components/main";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React, { useTransition } from "react";
import { useForm, Controller } from "react-hook-form";
import Editor from "@monaco-editor/react";
import { createSnippet } from "@/lib/actions/snippet.action";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface fieldTypes {
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

function New() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isPending, startTransition] = useTransition();
  const [language, setLanguage] = React.useState<undefined | string>(undefined);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
    watch,
  } = useForm<fieldTypes>({
    mode: "onChange",
  });
  const { title: titleValue, description: descriptionValue } = watch();
  const newSnippet = async (data: fieldTypes) => {
    startTransition(async () => {
      await createSnippet({ ...data, userId: session?.user?.id as string });
    });
    reset({ title: "", description: "", code: "" });
    router.push("/");
  };
  return (
    <>
      <Header pageTitle="New Snippet" />
      <Main>
        <form
          className="flex flex-col gap-5"
          onSubmit={handleSubmit(newSnippet)}
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
                  Creating
                </span>
              ) : (
                "Create Snippet"
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <Input
                className={`placeholder:text-gray-600 ${!titleValue && "border-gray-600"} ${
                  errors.title ? "border-red-500" : titleValue && "border-green-800"}`}
                placeholder="Title*"
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
              ): titleValue && (
                <span className="text-green-800 text-sm">
                  title is valid
                </span>
              )}
            </div>

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
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="border-gray-600 placeholder:text-blue-600">
                <SelectValue placeholder="Select a language"/>
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
                  language={language}
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

export default New;
