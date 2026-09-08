import { createFileRoute } from "@tanstack/react-router";
import { ShippingPolicyView } from "@/lib/policies";

export const Route = createFileRoute("/shipping-policy")({
  head: () => ({ meta: [{ title: "Shipping Policy — House of Phones" }, { property: "og:url", content: "/shipping-policy" }], links: [{ rel: "canonical", href: "/shipping-policy" }] }),
  component: ShippingPolicyView,
});
