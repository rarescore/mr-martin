import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "@/site/pages";

export const Route = createFileRoute("/privacy")({
  head: () => ({ meta: [{ title: "Privacy Policy — Mr. Martin" }] }),
  component: PrivacyPage,
});
