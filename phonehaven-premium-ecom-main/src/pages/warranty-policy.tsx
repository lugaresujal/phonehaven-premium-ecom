import { createFileRoute } from "@tanstack/react-router";
import { WarrantyPolicyView } from "@/lib/policies";
export const Route = createFileRoute("/warranty-policy")({
  head: () => ({ meta: [{ title: "Warranty Policy — House of Phones" }, { property: "og:url", content: "/warranty-policy" }], links: [{ rel: "canonical", href: "/warranty-policy" }] }),
  component: WarrantyPolicyView,
});
