// Stripe webhook — the authoritative confirmation path.
//
// Payment success, refunds and failed recurring charges all arrive here. The
// signature is verified before ANY database write, and fulfilment goes through
// the same shared module the in-app confirm path uses, so an order can never
// be recorded twice.

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["STRIPE_WEBHOOK_SECRET"];
        const signature = request.headers.get("stripe-signature") ?? "";
        const body = await request.text();

        if (!secret) return new Response("Webhook not configured", { status: 503 });
        const { verifyStripeSignature } = await import("@/lib/commerce/webhook.server");
        if (!verifyStripeSignature(body, signature, secret)) {
          return new Response("Invalid signature", { status: 401 });
        }

        const { handleStripeEvent } = await import("@/lib/commerce/webhook.server");
        try {
          await handleStripeEvent(JSON.parse(body));
        } catch (e) {
          return new Response(e instanceof Error ? e.message : "Webhook failed", { status: 500 });
        }
        return new Response("ok");
      },
    },
  },
});
