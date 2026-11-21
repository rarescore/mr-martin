import { createFileRoute } from "@tanstack/react-router";
import { TrackPage } from "@/site/pages";

export const Route = createFileRoute("/track")({
  head: () => ({ meta: [{ title: "Track Order — Mr. Martin" }] }),
  component: TrackPage,
});
