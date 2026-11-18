import type { Lead, PromoCode, StoreProfile } from "./types";

const CATEGORY_HOOKS: Record<Lead["category"], { group: string; angle: string }> = {
  gym: {
    group: "members",
    angle:
      "a healthy, grab-and-go meal option your members ask about after a workout",
  },
  clinic: {
    group: "staff",
    angle:
      "a fast, healthy lunch option for a team that rarely gets a real break",
  },
  school: {
    group: "staff",
    angle: "an easy, healthy lunch option for your teachers and staff",
  },
  office: {
    group: "team",
    angle: "a healthy catering option that makes breakroom lunches effortless",
  },
};

export interface EmailDraft {
  subject: string;
  body: string;
}

export function buildEmailDraft(
  store: StoreProfile,
  lead: Lead,
  promo: PromoCode
): EmailDraft {
  const hook = CATEGORY_HOOKS[lead.category];

  const subject = `Free sample meal drop for ${lead.name}'s ${hook.group} (from ${store.name})`;

  const body = `Hi there,

I'm ${store.managerName}, manager at ${store.name} (${store.address}) — just around the corner from ${lead.name}.

${store.offerText}

It's ${hook.angle}, and a good way to see if regular catering or drop-off service would be a fit for your ${hook.group}.

As a thank-you for giving us a try, here's a code for your team:

  Promo code: ${promo.code}
  ${store.discountText}

If you'd like to schedule a free sample drop, just reply to this email or give us a call at ${store.phone}, and we'll take it from there.

Thanks,
${store.managerName}
${store.name}
${store.phone}`;

  return { subject, body };
}
