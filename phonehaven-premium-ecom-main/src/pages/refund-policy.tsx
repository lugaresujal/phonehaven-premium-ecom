import { createFileRoute } from "@tanstack/react-router";
import { RefundPolicyView } from "@/lib/policies";
export const Route = createFileRoute("/refund-policy")({
  head: () => ({ meta: [{ title: "Returns & Refunds — House of Phones" }, { property: "og:url", content: "/refund-policy" }], links: [{ rel: "canonical", href: "/refund-policy" }] }),
  component: RefundPolicyView,
});
