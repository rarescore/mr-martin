import { createFileRoute } from "@tanstack/react-router";
import { ShippingPage } from "@/site/pages";

export const Route = createFileRoute("/shipping")({
  head: () => ({ meta: [{ title: "Shipping Policy — Mr. Martin" }] }),
  component: ShippingPage,
});
