import { createFileRoute } from "@tanstack/react-router";
import { TermsPage } from "@/site/pages";

export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms of Service — Mr. Martin" }] }),
  component: TermsPage,
});
