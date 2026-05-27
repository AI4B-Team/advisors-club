// Cross-route store for the signup wizard.
// /signup collects the account; /onboarding collects Club/Personalize/Plan.
export type SignupData = {
  firstName: string;
  lastName: string;
  email: string;
  niche: string;
  clubName: string;
  avatarColor: string;
  bio: string;
  theme: "light" | "dark";
  billing: "monthly" | "annual";
  planId: string;
};

const KEY = "signup-wizard-v1";

const DEFAULTS: SignupData = {
  firstName: "",
  lastName: "",
  email: "",
  niche: "",
  clubName: "",
  avatarColor: "#F5A623",
  bio: "",
  theme: "light",
  billing: "annual",
  planId: "advisor",
};

export function getSignupData(): SignupData {
  if (typeof window === "undefined") return { ...DEFAULTS };
  try {
    return { ...DEFAULTS, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") };
  } catch {
    return { ...DEFAULTS };
  }
}

export function setSignupData(partial: Partial<SignupData>) {
  if (typeof window === "undefined") return;
  const next = { ...getSignupData(), ...partial };
  sessionStorage.setItem(KEY, JSON.stringify(next));
}

export function clearSignupData() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
