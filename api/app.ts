import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import {
  catalog,
  unitPrice,
  extrasFor,
  choicesFor,
  type Line,
  type Item,
} from "../src/catalog.js";
import { location } from "../src/business.js";
type Req = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body: Record<string, unknown>;
  query: Record<string, string>;
};
type Res = {
  status: (n: number) => Res;
  json: (v: unknown) => void;
  setHeader: (k: string, v: string) => void;
};
const db = () => {
  if (!getApps().length)
    initializeApp({
      credential: cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || "{}"),
      ),
    });
  return getFirestore();
};
const secret = () => process.env.SESSION_SECRET || "";
function signature(v: string) {
  return createHmac("sha256", secret()).update(v).digest("hex");
}
function equal(a: string, b: string) {
  const x = Buffer.from(a),
    y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}
async function allowed(key: string, max: number) {
  const store = db(),
    ref = store.doc("rateLimits/" + signature(key));
  return store.runTransaction(async (tx) => {
    const old = (await tx.get(ref)).data();
    const now = Date.now();
    const count = old && old.until > now ? old.count + 1 : 1;
    if (count > max) return false;
    tx.set(ref, {
      count,
      until: old && old.until > now ? old.until : now + 600000,
    });
    return true;
  });
}
function session(req: Req) {
  const c = String(req.headers.cookie || "").match(
    /(?:^|; )mm_session=([^;]+)/,
  )?.[1];
  if (!c) return null;
  const [payload, sig] = c.split(".");
  if (!sig || !equal(signature(payload), sig)) return null;
  try {
    const s = JSON.parse(Buffer.from(payload, "base64url").toString());
    return s.exp > Date.now() ? s : null;
  } catch {
    return null;
  }
}
function cookie(res: Res, id: string, admin = false) {
  const p = Buffer.from(
    JSON.stringify({ id, admin, exp: Date.now() + 86400000 * 7 }),
  ).toString("base64url");
  res.setHeader(
    "Set-Cookie",
    `mm_session=${p}.${signature(p)}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
  );
}
export default async function handler(req: Req, res: Res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  try {
    if (!secret())
      return res
        .status(503)
        .json({ error: "Preview services are being configured." });
    const action = req.query.action || "state";
    const s = session(req);
    const body = req.body || {};
    if (!["GET", "POST"].includes(req.method || ""))
      return res.status(405).json({ error: "Method not allowed." });
    if (JSON.stringify(body).length > 250000)
      return res.status(413).json({ error: "Request too large." });
    if (req.method === "POST") {
      const origin = String(req.headers.origin || "");
      if (origin && new URL(origin).host !== req.headers.host)
        return res.status(403).json({ error: "Invalid request origin." });
    }
    if (action === "login" && req.method === "POST") {
      const ip = String(
        req.headers["x-vercel-forwarded-for"] ||
          req.headers["x-forwarded-for"] ||
          "unknown",
      ).split(",")[0];
      if (!(await allowed("login:" + ip, 30)))
        return res
          .status(429)
          .json({ error: "Too many attempts. Try again in ten minutes." });
      const pw = String(body.password || "");
      const admin = body.admin === true;
      const key = admin
        ? process.env.ADMIN_PASSWORD
        : process.env.PREVIEW_PASSWORD;
      if (!key || !equal(pw, key))
        return res.status(401).json({ error: "Incorrect password." });
      cookie(res, s?.id || randomBytes(16).toString("hex"), admin);
      return res.json({ ok: true, admin });
    }
    if (action === "logout" && req.method === "POST") {
      res.setHeader(
        "Set-Cookie",
        "mm_session=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0",
      );
      return res.json({ ok: true });
    }
    if (!s)
      return res
        .status(401)
        .json({ error: "Please unlock the private preview." });
    const store = db();
    const cfg = (await store.doc("config/site").get()).data() || {};
    const menu: Item[] = cfg.menu || catalog;
    if (action === "state")
      return res.json({
        menu,
        location: cfg.location || location,
        announcement: cfg.announcement || "",
        admin: s.admin,
        specials: cfg.specials || [],
        locations: cfg.locations || [],
        testMode: true,
      });
    if (action === "settings" && req.method === "POST") {
      if (!s.admin)
        return res.status(403).json({ error: "Owner access required." });
      if (JSON.stringify(body).length > 250000)
        return res.status(400).json({ error: "Settings too large." });
      if (!Array.isArray(body.menu) || body.menu.length > 200)
        return res.status(400).json({ error: "Invalid menu." });
      for (const i of body.menu as Item[])
        if (
          !i.id ||
          typeof i.name !== "string" ||
          !i.name.trim() ||
          typeof i.description !== "string" ||
          typeof i.category !== "string" ||
          typeof i.available !== "boolean" ||
          !Array.isArray(i.sizes) ||
          i.sizes.some(
            (z) =>
              !Number.isInteger(z.cents) || z.cents < 0 || z.cents > 100000,
          )
        )
          return res.status(400).json({ error: "Invalid item price." });
      const loc = body.location as typeof location;
      const validHours = (h: unknown) =>
        h === null ||
        (typeof h === "object" &&
          h !== null &&
          "open" in h &&
          "close" in h &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(String(h.open)) &&
          /^([01]\d|2[0-3]):[0-5]\d$/.test(String(h.close)) &&
          String(h.open) < String(h.close));
      if (
        !loc ||
        !loc.address ||
        !loc.city ||
        !loc.phone ||
        !Array.isArray(loc.hours) ||
        loc.hours.length !== 7 ||
        !loc.hours.every(validHours) ||
        !loc.specialHours ||
        !Object.entries(loc.specialHours).every(
          ([d, h]) => /^\d{4}-\d{2}-\d{2}$/.test(d) && validHours(h),
        )
      )
        throw new Error(
          "Invalid location or hours. Closing time must be after opening.",
        );
      if (
        new Set((body.menu as Item[]).map((i) => i.id)).size !==
        body.menu.length
      )
        throw new Error("Invalid duplicate item IDs.");
      const specials = body.specials as {
        id: string;
        title: string;
        description: string;
        start: string;
        end: string;
      }[];
      if (
        !Array.isArray(specials) ||
        specials.length > 30 ||
        specials.some(
          (x) =>
            !x.id ||
            !x.title.trim() ||
            !x.description.trim() ||
            (x.start && !/^\d{4}-\d{2}-\d{2}$/.test(x.start)) ||
            (x.end &&
              (!/^\d{4}-\d{2}-\d{2}$/.test(x.end) ||
                (x.start && x.end < x.start))),
        )
      )
        throw new Error(
          "Invalid special. Add a title, details and valid dates.",
        );
      const locations = body.locations as (typeof location)[];
      if (
        !Array.isArray(locations) ||
        locations.length > 30 ||
        locations.some(
          (x) =>
            !x.id ||
            !x.name ||
            !x.address ||
            !x.city ||
            !x.phone ||
            !/^[a-z0-9-]+$/.test(x.slug) ||
            x.slug === loc.slug ||
            !Array.isArray(x.hours) ||
            x.hours.length !== 7 ||
            !x.hours.every(validHours),
        )
      )
        throw new Error(
          "Invalid location. Complete each field and use a unique lowercase URL slug.",
        );
      if (new Set(locations.map((l) => l.slug)).size !== locations.length)
        throw new Error("Invalid duplicate location URL.");
      await store.doc("config/site").set({
        menu: body.menu,
        location: body.location,
        announcement: String(body.announcement || "").slice(0, 200),
        specials,
        locations,
      });
      return res.json({ ok: true });
    }
    if (action === "orders" && req.method === "POST") {
      if (!(await allowed("orders:" + s.id, 30)))
        return res
          .status(429)
          .json({ error: "Too many test orders. Try again in ten minutes." });
      const lines = body.lines as Line[];
      if (!Array.isArray(lines) || !lines.length || lines.length > 50)
        return res.status(400).json({ error: "Add items to your cart first." });
      const normalized = lines.map((l) => {
        const i = menu.find((x) => x.id === l.itemId);
        if (
          !i?.available ||
          !i.sizes[l.size] ||
          !Number.isInteger(l.quantity) ||
          l.quantity < 1 ||
          l.quantity > 20 ||
          !Array.isArray(l.extras)
        )
          throw new Error("An item or quantity is no longer available.");
        if (
          l.extras.some((x) => !extrasFor(i).some((e) => e.id === x)) ||
          new Set(l.extras).size !== l.extras.length
        )
          throw new Error("Invalid item extras.");
        const choices = choicesFor(i);
        if (choices.length && !choices.includes(l.choice))
          throw new Error("Invalid item sauce, dressing or flavor.");
        return {
          name: i.name,
          size: i.sizes[l.size].label,
          extras: l.extras.slice(0, 30),
          choice: String(l.choice || "").slice(0, 100),
          notes: String(l.notes || "").slice(0, 500),
          quantity: l.quantity,
          unit: unitPrice(i, l),
        };
      });
      const name = String(body.name || "")
        .trim()
        .slice(0, 80);
      if (!name) throw new Error("Enter a name for your test order.");
      const doc = store.collection("testOrders").doc(
        String(body.requestId || "")
          .replace(/[^a-zA-Z0-9-]/g, "")
          .slice(0, 60) || randomBytes(16).toString("hex"),
      );
      const previous = await doc.get();
      if (previous.exists) {
        if (previous.data()?.session !== s.id)
          return res
            .status(409)
            .json({ error: "Please retry with a new cart." });
        return res.json({ id: doc.id, ...previous.data() });
      }
      const value = {
        session: s.id,
        name,
        lines: normalized,
        subtotal: normalized.reduce((t, l) => t + l.unit * l.quantity, 0),
        fulfillment: "pickup",
        status: "Received",
        test: true,
        createdAt: new Date().toISOString(),
      };
      await doc.create(value);
      return res.json({ id: doc.id, ...value });
    }
    if (action === "orders" && req.method === "GET") {
      const snap = await (
        s.admin
          ? store.collection("testOrders")
          : store.collection("testOrders").where("session", "==", s.id)
      )
        .limit(100)
        .get();
      return res.json(
        snap.docs
          .map((d) => ({
            id: d.id,
            ...d.data(),
            createdAt: String(d.data().createdAt),
          }))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
      );
    }
    if (action === "order-status" && req.method === "POST") {
      if (!s.admin)
        return res.status(403).json({ error: "Owner access required." });
      if (
        !["Received", "Preparing", "Ready", "Completed", "Cancelled"].includes(
          String(body.status),
        )
      )
        throw new Error("Invalid status.");
      await store
        .doc(`testOrders/${String(body.id).replace(/[^a-zA-Z0-9-]/g, "")}`)
        .update({ status: body.status });
      return res.json({ ok: true });
    }
    if (action === "messages" && req.method === "POST") {
      if (!(await allowed("messages:" + s.id, 10)))
        return res
          .status(429)
          .json({ error: "Too many inquiries. Try again in ten minutes." });
      const name = String(body.name || "").trim(),
        email = String(body.email || "").trim(),
        message = String(body.message || "").trim();
      if (
        !name ||
        name.length > 80 ||
        !/^\S+@\S+\.\S+$/.test(email) ||
        email.length > 254 ||
        message.length < 5 ||
        message.length > 3000
      )
        throw new Error(
          "Enter a name, valid email and a message of 5–3000 characters.",
        );
      if (body.website) return res.json({ ok: true });
      await store.collection("messages").add({
        name,
        email,
        message,
        phone: String(body.phone || "").slice(0, 30),
        type: String(body.type || "General").slice(0, 30),
        createdAt: new Date().toISOString(),
        test: true,
      });
      return res.json({ ok: true });
    }
    if (action === "messages" && req.method === "GET") {
      if (!s.admin)
        return res.status(403).json({ error: "Owner access required." });
      const snap = await store.collection("messages").limit(100).get();
      return res.json(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    }
    return res.status(404).json({ error: "Unknown action." });
  } catch (e) {
    return res.status(400).json({
      error:
        e instanceof Error && /item|quantity|Enter|Invalid/.test(e.message)
          ? e.message
          : "Unable to save right now. Please retry.",
    });
  }
}
