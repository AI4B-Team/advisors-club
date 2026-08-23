/**
 * Prompt registry. Every system prompt in the product is defined here, never
 * inline at a call site. Shared product/safety rules live in ./shared.
 */
export * from "./shared";
export * from "./aiva";
export * from "./persona";
export * from "./apps";
export * from "./navigation";
export * from "./sales";
export * from "./onboarding";
