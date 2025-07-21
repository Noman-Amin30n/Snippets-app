"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Snippet from "@/components/snippet";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Header from "@/components/header";
import Main from "@/components/main";
import { getSnippets } from "@/lib/actions/snippet.action";
import { SnippetType } from "@/models/snippet.model";
import { ObjectId } from "mongoose";

function Snippets() {
  const { data: session, status } = useSession();
  const [snippets, setSnippets] = useState<SnippetType[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userId = session?.user?.id as string;

  const refreshSnippets = async () => {
    setPage(1);
    setHasMore(true);
    try {
      const data = await getSnippets(1, 10, userId);
      if (data && data.snippets) {
        setSnippets((data.snippets as SnippetType[]));
        if (data.totalPages > 1) {
          setPage(2);
          setHasMore(true);
        } else {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to refresh snippets", err);
    }
  };

  const loadSnippets = async () => {
    if (!hasMore) return;

    setLoading(true);
    setError(null);
    try {
      console.log(userId);
      const data = await getSnippets(page, 10, userId);
      if (!data || !data.snippets) {
        setHasMore(false);
        return;
      }

      setSnippets((prev) => [...prev, ...(data.snippets as SnippetType[])]);
      if (page >= data.totalPages) {
        setHasMore(false);
      } else {
        setPage((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Failed to load snippets:", err);
      setError("Failed to load snippets. Please try again.");
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadSnippets();
    }
  }, [status]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.offsetHeight
      ) {
        if (hasMore && !loading) loadSnippets();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, page, loading]);

  return (
    <>
      <Header pageTitle="Snippets" />
      <Main>
        <div className="flex justify-end">
          <Link href="/snippets/new">
            <Button className="text-sm cursor-pointer">New</Button>
          </Link>
        </div>

        {snippets.map((snippet, index) => (
          <Snippet
            key={(snippet._id as ObjectId).toString()}
            index={index + 1} // remove index or handle it inside <Snippet> if needed
            title={snippet.title}
            view={`/snippets/${(snippet._id as ObjectId).toString()}`}
            edit={`/snippets/edit/${(snippet._id as ObjectId).toString()}`}
            deleteID={snippet._id as string}
            onDelete={refreshSnippets}
          />
        ))}

        {loading && snippets.length === 0 && (
          <p className="text-center text-gray-500 mt-10">Loading snippets...</p>
        )}

        {!loading && snippets.length === 0 && !error && (
          <p className="text-center text-gray-500 mt-10">No snippets found.</p>
        )}

        {error && <p className="text-center text-red-500 mt-10">{error}</p>}

        {loading && snippets.length > 0 && (
          <div className="text-center py-6 text-sm text-gray-500">
            Loading more...
          </div>
        )}
      </Main>
    </>
  );
}

export default Snippets;
