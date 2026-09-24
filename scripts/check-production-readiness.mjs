import { readFileSync } from "node:fs";

const business = JSON.parse(readFileSync(new URL("../frontend/src/config/business.json", import.meta.url), "utf8"));
const missing = ["legal_name", "address", "kvk_number", "contact_email"].filter(
  (key) => typeof business[key] !== "string" || !business[key].trim()
);
if (missing.length) throw new Error(`Complete business details before production: ${missing.join(", ")}`);
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(business.contact_email)) throw new Error("Invalid business contact email");
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(process.env.CONTACT_NOTIFICATION_EMAIL || "")) {
  throw new Error("Configure CONTACT_NOTIFICATION_EMAIL with a confirmed receiving mailbox.");
}
console.log("Business details and contact recipient configured. Legal review and mailbox delivery still need verification.");
