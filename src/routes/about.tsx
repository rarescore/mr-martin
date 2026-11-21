import { createFileRoute } from "@tanstack/react-router";
import { AboutPage } from "@/about/page";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Mr. Martin" },
      {
        name: "description",
        content: "The field, the roast, and the crack. Mr. Martin sunflower seeds, grown and roasted in California.",
      },
    ],
  }),
  component: AboutPage,
});
