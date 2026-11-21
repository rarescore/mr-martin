import { createFileRoute } from "@tanstack/react-router";
import { DoNotSellPage } from "@/site/pages";

export const Route = createFileRoute("/do-not-sell")({
  head: () => ({ meta: [{ title: "Do Not Sell — Mr. Martin" }] }),
  component: DoNotSellPage,
});
