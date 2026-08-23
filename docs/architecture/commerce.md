# Commerce Architecture

The conceptual model is unchanged: **Product → Offer → Order → Entitlement → resolveAccess()**.
What changed is *where authority lives*.

## Server flow

```
client                       server                          provider
------                       ------                          --------
buy(offer)  ──────────────▶  startCheckoutFn
                             • membership + price validated
                             • checkout_sessions row (pending) ──▶ create session
                                                            ◀── url / ref
            ◀── redirect or sandbox confirm
                             confirmCheckoutFn  ─────────────▶ verify(ref)
   webhook ────────────────▶ /api/public/webhooks/stripe   (signed)
                             fulfillSession()
                               • orders + order_items (paid)
                               • entitlements (granted)
refreshEntitlements() ◀───── listEntitlementsFn (RLS, own rows)
```

`purchaseProduct()` no longer grants anything. It opens a server session; only
`fulfillSession` (confirm path or webhook, sharing one module) writes an order
and an entitlement.

## Provider integration

`src/lib/commerce/providers.server.ts` defines one `PaymentProvider` interface
with two adapters:

- **stripe** — used automatically when `STRIPE_SECRET_KEY` exists. Hosted
  Checkout, one-time and recurring, with `payment_intent_data[transfer_data]`
  pointed at the club's Stripe Connect account (`clubs.settings.payments.stripeAccountId`)
  so creators receive their own revenue. Webhook secret: `STRIPE_WEBHOOK_SECRET`.
- **sandbox** — used until those keys exist. Same server flow, no money, every
  row tagged `provider = 'sandbox'` and excluded from revenue.

No second payment system was introduced.

## Data model

| Table | Role |
| --- | --- |
| `offers` | how a product is sold (price, interval, includes) |
| `checkout_sessions` | one attempted purchase; server-written only |
| `orders` / `order_items` | purchase record, provider ref, paid/refunded/failed |
| `entitlements` | what a member may access; unique per active product |

RLS: members read only their own sessions/orders/entitlements; club admins read
their club's; **no client can insert or update any of them**. All writes use the
service role inside server functions after the caller is authorized.

## Entitlements on the client

`entitlements.ts` keeps its API but has two modes:

- **server mode** (a real club is active) — read-only mirror hydrated by
  `remote.ts`; client writes are ignored with a warning.
- **prototype mode** (no club yet) — the original localStorage ledger, so demo
  content still works before a club exists.

`resolveAccess()` is unchanged in shape and still the single gate. The only
behavioural change: the entitlement list it reads is now the server's.

## Apps, courses, coaching

No product type owns a purchase ledger. `apps/access.ts` still translates an app
into a `ProductRef` and delegates to `resolveAccess`. Membership-included,
plan-included, course/coaching-included and bundled access are all policy rules
resolved in one place.

## Admin preview

`canBypassPaywall` comes from the server-resolved capability, never the
Admin/Member switcher. Preview yields `grantedBy: "admin"` — it never creates an
entitlement or an order.

## Refunds, cancellations, expiry

`revokeForOrder(order, reason)` handles `refund`, `cancellation` and
`payment_failed`: the order is marked, the entitlement is revoked. Stripe events
`charge.refunded`, `customer.subscription.deleted` and `invoice.payment_failed`
route to it. Subscription entitlements carry `expires_at` and lapse on their own.

## Revenue

`revenueSummaryFn` aggregates paid `orders` / `order_items` for club admins and
reports `live: false` while the sandbox provider is active. The Apps dashboard
now reads this instead of local usage events.

## Legacy localStorage still present

- `entitlements.ts` prototype branch (used only with no club selected).
- `checkout.ts` prototype branch of `purchaseProduct`.
- `apps/usage.ts` opens/completions analytics, and its `revenue` field, which is
  now only a fallback before a club exists.
- Flywheel/persona modules read the ledger (now server-mirrored) rather than
  localStorage directly.
