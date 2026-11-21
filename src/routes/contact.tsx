import { createFileRoute } from "@tanstack/react-router";
import { ContactPage } from "@/site/pages";

export const Route = createFileRoute("/contact")({
  head: () => ({ meta: [{ title: "Contact — Mr. Martin" }] }),
  component: ContactPage,
});
