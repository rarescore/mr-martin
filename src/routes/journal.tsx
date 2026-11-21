import { createFileRoute } from "@tanstack/react-router";
import { JournalPage } from "@/site/pages";

export const Route = createFileRoute("/journal")({
  head: () => ({ meta: [{ title: "Journal — Mr. Martin" }] }),
  component: JournalPage,
});
