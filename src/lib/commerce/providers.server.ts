// Payment providers — server only.
//
// One adapter interface, one selection point. Stripe is the product direction
// (creators are paid through Stripe Connect), so the Stripe adapter is the
// real implementation and is used as soon as the platform Stripe credentials
// exist. Until then the sandbox adapter runs the SAME server-side flow —
// session → provider confirmation → order → entitlement — with no money moved
// and every row tagged `provider = 'sandbox'` so test data can never be
// mistaken for revenue.

export type ProviderName = "stripe" | "sandbox" | "free";

export type CheckoutRequest = {
  sessionId: string;
  clubId: string;
  userId: string;
  productKey: string;
  productLabel: string;
  amountCents: number;
  currency: string;
  interval?: "month" | "year" | null;
  /** Stripe Connect account of the PAYEE club, when they are onboarded. */
  connectedAccountId?: string | null;
  /** Advisors Club's share, taken as an application fee on a connected sale. */
  platformFeeCents?: number;
  successUrl: string;
  cancelUrl: string;
};

export type CheckoutSession = {
  provider: ProviderName;
  providerRef: string | null;
  /** Present when the member must be redirected to the provider. */
  checkoutUrl: string | null;
  /** True when the flow can be confirmed without leaving the app (sandbox). */
  requiresConfirmation: boolean;
};

export type PaymentProvider = {
  name: ProviderName;
  createCheckout(req: CheckoutRequest): Promise<CheckoutSession>;
  /** Server-side truth check. Never trust the browser's word for this. */
  verify(providerRef: string): Promise<{ paid: boolean; amountCents?: number; failureReason?: string }>;
  refund(providerRef: string): Promise<{ ok: boolean; error?: string }>;
};

/* ------------------------------------------------------------------ */
/* Stripe                                                              */
/* ------------------------------------------------------------------ */

function stripeKey(): string | undefined {
  return process.env["STRIPE_SECRET_KEY"] || undefined;
}

async function stripeCall(path: string, body?: Record<string, string>, method = "POST") {
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${stripeKey()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body ? new URLSearchParams(body).toString() : undefined,
  });
  const json = (await res.json()) as Record<string, unknown>;
  if (!res.ok) throw new Error(String((json["error"] as { message?: string } | undefined)?.message ?? "Stripe request failed"));
  return json;
}

const stripeProvider: PaymentProvider = {
  name: "stripe",
  async createCheckout(req) {
    const body: Record<string, string> = {
      mode: req.interval ? "subscription" : "payment",
      success_url: req.successUrl,
      cancel_url: req.cancelUrl,
      client_reference_id: req.sessionId,
      "metadata[session_id]": req.sessionId,
      "metadata[club_id]": req.clubId,
      "metadata[product_key]": req.productKey,
      "line_items[0][quantity]": "1",
      "line_items[0][price_data][currency]": req.currency,
      "line_items[0][price_data][unit_amount]": String(req.amountCents),
      "line_items[0][price_data][product_data][name]": req.productLabel,
    };
    if (req.interval) body["line_items[0][price_data][recurring][interval]"] = req.interval;
    // Creator payouts: the payee's connected account receives the funds. On a
    // marketplace sale the platform share rides along as an application fee,
    // so Stripe splits it rather than us invoicing for it afterwards.
    if (req.connectedAccountId) {
      body["payment_intent_data[transfer_data][destination]"] = req.connectedAccountId;
      if (req.platformFeeCents && req.platformFeeCents > 0) {
        body["payment_intent_data[application_fee_amount]"] = String(req.platformFeeCents);
      }
    }
    const session = await stripeCall("checkout/sessions", body);
    return {
      provider: "stripe",
      providerRef: String(session["id"]),
      checkoutUrl: String(session["url"]),
      requiresConfirmation: false,
    };
  },
  async verify(providerRef) {
    const session = await stripeCall(`checkout/sessions/${providerRef}`, undefined, "GET");
    const paid = session["payment_status"] === "paid";
    return {
      paid,
      amountCents: Number(session["amount_total"] ?? 0),
      failureReason: paid ? undefined : `Payment ${String(session["payment_status"] ?? "incomplete")}`,
    };
  },
  async refund(providerRef) {
    try {
      const session = await stripeCall(`checkout/sessions/${providerRef}`, undefined, "GET");
      const intent = session["payment_intent"];
      if (!intent) return { ok: false, error: "No payment to refund." };
      await stripeCall("refunds", { payment_intent: String(intent) });
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : "Refund failed." };
    }
  },
};

/* ------------------------------------------------------------------ */
/* Sandbox                                                             */
/* ------------------------------------------------------------------ */

/**
 * Test provider. It exercises the real server flow without a payment
 * processor. A checkout only becomes paid when the server confirms it, and a
 * request carrying `simulate: "fail"` stays unpaid so the failure path can be
 * tested end to end.
 */
const sandboxProvider: PaymentProvider = {
  name: "sandbox",
  async createCheckout(req) {
    return {
      provider: "sandbox",
      providerRef: `sbx_${req.sessionId}`,
      checkoutUrl: null,
      requiresConfirmation: true,
    };
  },
  async verify(providerRef) {
    if (providerRef.endsWith(":fail")) return { paid: false, failureReason: "Card Declined (Test)." };
    return { paid: true };
  },
  async refund() {
    return { ok: true };
  },
};

export function paymentProvider(): PaymentProvider {
  return stripeKey() ? stripeProvider : sandboxProvider;
}

export function providerIsLive(): boolean {
  return Boolean(stripeKey());
}
