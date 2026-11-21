import { createFileRoute } from "@tanstack/react-router";
import { SearchPage } from "@/site/pages";

export const Route = createFileRoute("/search")({
  head: () => ({ meta: [{ title: "Search — Mr. Martin" }] }),
  component: SearchPage,
});
