// Stripe webhook handling. Server only.

import { createHmac, timingSafeEqual } from "crypto";
import { adminClient, fulfillSession, revokeForOrder, type SessionRow } from "./fulfillment.server";

/** Stripe's `t=...,v1=...` scheme, verified without the SDK. */
export function verifyStripeSignature(body: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(
    header.split(",").map(p => p.split("=") as [string, string]).filter(p => p.length === 2),
  );
  const timestamp = parts["t"];
  const provided = parts["v1"];
  if (!timestamp || !provided) return false;

  // Reject replays older than five minutes.
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const expected = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

type StripeEvent = { type: string; data: { object: Record<string, any> } };

export async function handleStripeEvent(event: StripeEvent): Promise<void> {
  const admin = await adminClient();
  const object = event.data?.object ?? {};

  switch (event.type) {
    case "checkout.session.completed":
    case "invoice.paid": {
      const ref = String(object["id"] ?? "");
      const sessionId = object["client_reference_id"] ?? object["metadata"]?.["session_id"];
      const { data } = await admin
        .from("checkout_sessions")
        .select("*")
        .or(`id.eq.${sessionId ?? "00000000-0000-0000-0000-000000000000"},provider_ref.eq.${ref}`)
        .maybeSingle();
      if (data) await fulfillSession(admin, data as SessionRow);
      break;
    }
    case "charge.refunded":
    case "customer.subscription.deleted":
    case "invoice.payment_failed": {
      const providerRef = String(object["id"] ?? "");
      const { data: order } = await admin
        .from("orders")
        .select("id")
        .eq("provider_ref", providerRef)
        .maybeSingle();
      if (order) {
        await revokeForOrder(
          admin,
          order.id,
          event.type === "charge.refunded"
            ? "refund"
            : event.type === "invoice.payment_failed"
              ? "payment_failed"
              : "cancellation",
        );
      }
      break;
    }
    default:
      break;
  }
}
