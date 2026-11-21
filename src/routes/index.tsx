import { createFileRoute } from "@tanstack/react-router";
import { MartinPage } from "@/martin/page";

export const Route = createFileRoute("/")({
  component: MartinPage,
});
