import { createFileRoute } from "@tanstack/react-router";
import { TermsPolicyView } from "@/lib/policies";
export const Route = createFileRoute("/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — House of Phones" }, { property: "og:url", content: "/terms" }], links: [{ rel: "canonical", href: "/terms" }] }),
  component: () => <TermsPolicyView />,
});
