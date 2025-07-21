"use client";
import { Button } from "@/components/ui/button";
import { LoaderCircle, SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useTransition } from "react";
import { deleteSnippet } from "@/lib/actions/snippet.action";
import { useRouter } from "next/navigation";

function ViewButtons({id}: {id : string}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const handleDelete = async (deleteID: string) => {
    startTransition(async() => {
      await deleteSnippet(deleteID);
    });
    router.push("/");  
  };
  return (
    <div className="flex items-center justify-end gap-3">
      <Link href={`/snippets/edit/${id}`}>
        <Button className="text-sm cursor-pointer">
          <SquarePen className="mr-1" />
          Edit
        </Button>
      </Link>
      <Button className="text-sm cursor-pointer bg-red-500 text-white hover:bg-red-600 transition-colors" onClick={() => handleDelete(id)}>
        {isPending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
      </Button>
    </div>
  );
}

export { ViewButtons };
