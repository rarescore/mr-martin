import { createFileRoute } from "@tanstack/react-router";
import { FaqPage } from "@/site/pages";

export const Route = createFileRoute("/faqs")({
  head: () => ({ meta: [{ title: "FAQs — Mr. Martin" }] }),
  component: FaqPage,
});
