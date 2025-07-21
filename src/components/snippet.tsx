import React, { useTransition } from "react";
import { Button } from "./ui/button";
import Link from "next/link";
import { SquarePen } from "lucide-react";
import { Eye } from "lucide-react";
import { Trash2 } from "lucide-react";
import { deleteSnippet } from "@/lib/actions/snippet.action";
import { LoaderCircle } from "lucide-react";

function Snippet({
  index,
  title,
  view,
  edit,
  deleteID,
  onDelete
}: {
  index: number;
  title: string;
  view: string;
  edit: string;
  deleteID: string;
  onDelete : () => void;
}) {
  return (
    <div className="flex justify-between items-stretch gap-5 py-2 px-3 bg-slate-200 rounded-md text-slate-900">
      <span className="flex items-center">{index}</span>
      <span className="grow flex justify-start items-center">{title}</span>
      <Link href={edit}>
        <Button className="text-sm cursor-pointer">
          <SquarePen className="mr-1" />
          Edit
        </Button>
      </Link>
      <Link href={view}>
        <Button className="text-sm cursor-pointer">
          <Eye className="mr-1" />
          View
        </Button>
      </Link>
      <Delete id={deleteID} onDelete={onDelete}/>
    </div>
  );
}

export function Delete({ id, onDelete }: { id: string, onDelete?: () => void }) {
  const [ispending, startTransition] = useTransition();
  const handleDelete = async (deleteID: string) => {
    startTransition(async() => {
      await deleteSnippet(deleteID);
    });
    if (onDelete) {
      onDelete();  
    };
  };
  return (
    <Button
      className="text-sm cursor-pointer bg-red-500 text-white hover:bg-red-600 transition-colors"
      onClick={() => {
        handleDelete(id);
      }}
    >
      {ispending ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
    </Button>
  );
}

export default Snippet;
