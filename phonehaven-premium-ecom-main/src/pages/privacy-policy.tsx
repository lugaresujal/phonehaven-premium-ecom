import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPolicyView } from "@/lib/policies";
export const Route = createFileRoute("/privacy-policy")({
  head: () => ({ meta: [{ title: "Privacy Policy — House of Phones" }, { property: "og:url", content: "/privacy-policy" }], links: [{ rel: "canonical", href: "/privacy-policy" }] }),
  component: () => <PrivacyPolicyView />,
});
