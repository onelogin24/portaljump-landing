import { NOTICE_VERSION } from "./content/site";

interface Env {
  WAITLIST_ENDPOINT?: string;
  WAITLIST_TOKEN?: string;
}

type CfRequest = Request & { cf?: { country?: string; region?: string; city?: string } };

const ALLOWED_ORIGINS = ["https://portaljump.co", "https://www.portaljump.co"];
const MAX_BODY = 2048;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const FIELDS = ["email", "page", "noticeVersion"];

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

const failed = () => json({ ok: false, error: "failed" }, 500);

async function waitlist(request: CfRequest, env: Env): Promise<Response> {
  const origin = request.headers.get("Origin") ?? "";
  if (!ALLOWED_ORIGINS.includes(origin)) return json({ ok: false, error: "failed" }, 403);
  const type = (request.headers.get("Content-Type") ?? "").split(";")[0].trim().toLowerCase();
  if (type !== "application/json") return json({ ok: false, error: "failed" }, 415);

  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > MAX_BODY) return json({ ok: false, error: "failed" }, 413);

  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "failed" }, 400);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return json({ ok: false, error: "failed" }, 400);
  const body = data as Record<string, unknown>;
  if (Object.keys(body).some((k) => !FIELDS.includes(k))) return json({ ok: false, error: "failed" }, 400);

  const { email: rawEmail, page, noticeVersion } = body;
  if (typeof rawEmail !== "string") return json({ ok: false, error: "invalid_email" }, 400);
  const email = rawEmail.trim();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json({ ok: false, error: "invalid_email" }, 400);
  if (typeof page !== "string" || !page.startsWith("/") || page.length > 100) return json({ ok: false, error: "failed" }, 400);
  if (noticeVersion !== NOTICE_VERSION) return json({ ok: false, error: "failed" }, 400);

  if (!env.WAITLIST_ENDPOINT || !env.WAITLIST_TOKEN) return failed();

  const cf = request.cf ?? {};
  try {
    const res = await fetch(env.WAITLIST_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: env.WAITLIST_TOKEN,
        email,
        country: cf.country ?? "",
        region: cf.region ?? "",
        city: cf.city ?? "",
        page,
        noticeVersion,
        submittedAt: new Date().toISOString(),
      }),
      redirect: "follow",
    });
    const reply = (await res.json()) as { ok?: unknown; error?: unknown };
    if (reply.ok === true) return json({ ok: true });
    if (reply.error === "invalid_email") return json({ ok: false, error: "invalid_email" }, 400);
    return failed();
  } catch {
    return failed();
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (request.method === "POST" && pathname === "/api/waitlist") return waitlist(request as CfRequest, env);
    return new Response("Not found", { status: 404 });
  },
};
