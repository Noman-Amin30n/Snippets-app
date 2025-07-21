import React from "react";
import Snippets from "./snippets";

function SnippetsPage() {
  return <>
    <Snippets />
  </>;
}

export const metadata = {
  title: "All snippets",
  description: "This page contains all the code snippets.",
};

export default SnippetsPage;
