import { createHash, randomBytes } from "node:crypto";
import { MongoClient } from "mongodb";

// Same database the CI-started backend points at (see .github/workflows/test.yml's
// e2e job) — never a staging/production URL. Read fresh per call so tests stay
// independent of import order.
function target() {
  return {
    url: process.env.MONGO_URL ?? "mongodb://127.0.0.1:27017",
    dbName: process.env.DB_NAME ?? "dutchvacancy_e2e",
  };
}

/**
 * Marks a freshly registered account as email-verified by writing straight to Mongo,
 * bypassing the real click-the-link flow. The verification flow itself (token issuance,
 * expiry, the /verify-email page) is covered elsewhere (backend/tests, manual staging
 * pass) — specs that use this are testing something downstream of it (posting a
 * vacancy, applying, scheduling an interview), which requires `email_verified: true`
 * and has no real mailbox to click a link in during CI.
 */
/** Moves a vacancy's closing date into the past, to test the closed state without waiting. */
export async function expireJobDirectly(jobId: string): Promise<void> {
  const { url, dbName } = target();
  const client = new MongoClient(url);
  try {
    await client.connect();
    const result = await client
      .db(dbName)
      .collection("jobs")
      .updateOne({ id: jobId }, { $set: { valid_through: new Date(Date.now() - 60_000) } });
    if (result.matchedCount === 0) throw new Error(`expireJobDirectly: no job ${jobId}`);
  } finally {
    await client.close();
  }
}

export async function verifyEmailDirectly(email: string): Promise<void> {
  const { url, dbName } = target();
  const client = new MongoClient(url);
  try {
    await client.connect();
    const result = await client
      .db(dbName)
      .collection("users")
      .updateOne({ email: email.toLowerCase() }, { $set: { email_verified: true } });
    if (result.matchedCount === 0) {
      throw new Error(`verifyEmailDirectly: no user found for ${email}`);
    }
  } finally {
    await client.close();
  }
}

/**
 * Lets a vacancy through moderation as if a person approved it. Specs about applying
 * and interviews use this; the review page itself is covered by moderation.spec.ts.
 */
export async function approveVacancyDirectly(jobId: string): Promise<void> {
  const { url, dbName } = target();
  const client = new MongoClient(url);
  try {
    await client.connect();
    const result = await client
      .db(dbName)
      .collection("jobs")
      .updateOne({ id: jobId }, { $set: { moderation_status: "approved", moderation_note: "" } });
    if (result.matchedCount === 0) throw new Error(`approveVacancyDirectly: no job ${jobId}`);
  } finally {
    await client.close();
  }
}

/**
 * A working review link for a vacancy, stored the way backend/lib/moderation.py stores
 * it (sha256 of the token). The real link only goes to the moderation inbox by email.
 */
export async function reviewLinkDirectly(
  jobId: string,
  reason: "first_vacancy" | "flagged" | "report" | "resubmitted" = "first_vacancy",
  findings: { category: string; phrase: string; field: string }[] = [],
): Promise<string> {
  const { url, dbName } = target();
  const client = new MongoClient(url);
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  try {
    await client.connect();
    await client.db(dbName).collection("moderation_reviews").insertOne({
      token_hash: createHash("sha256").update(token).digest("hex"),
      job_id: jobId,
      reason,
      findings,
      created_at: now,
      expires_at: new Date(now.getTime() + 30 * 86_400_000),
      used_at: null,
    });
  } finally {
    await client.close();
  }
  return `/en/review/${token}`;
}
