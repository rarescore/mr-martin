import { createFileRoute } from "@tanstack/react-router";
import { RefundPage } from "@/site/pages";

export const Route = createFileRoute("/refund")({
  head: () => ({ meta: [{ title: "Refund Policy — Mr. Martin" }] }),
  component: RefundPage,
});
