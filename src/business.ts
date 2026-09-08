export type Hours = { open: string; close: string } | null;
export type Location = {
  id: string;
  slug: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  hours: Hours[];
  specialHours: Record<string, Hours>;
  carryout: boolean;
  delivery: boolean;
  dineIn: boolean;
};
export const location: Location = {
  id: "erie",
  slug: "erie-38th-st",
  name: "Erie · West 38th Street",
  address: "1529 W 38th St",
  city: "Erie",
  state: "PA",
  zip: "16508",
  phone: "814-790-5868",
  hours: [
    null,
    null,
    { open: "16:00", close: "20:00" },
    { open: "16:00", close: "20:00" },
    { open: "15:00", close: "21:00" },
    { open: "15:00", close: "21:00" },
    { open: "15:00", close: "19:00" },
  ],
  specialHours: {},
  carryout: true,
  delivery: true,
  dineIn: false,
};
export const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
export const time = (v: string) => {
  const [h, m] = v.split(":").map(Number);
  return `${h % 12 || 12}${m ? ":" + String(m).padStart(2, "0") : ""} ${h >= 12 ? "PM" : "AM"}`;
};
export function status(loc: Location, now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((x) => [x.type, x.value]),
  );
  const date = `${parts.year}-${parts.month}-${parts.day}`;
  const today = new Date(date + "T12:00:00Z");
  const minute = Number(parts.hour) * 60 + Number(parts.minute);
  const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
  const get = (d: Date) => {
    const key = d.toISOString().slice(0, 10);
    return key in loc.specialHours
      ? loc.specialHours[key]
      : loc.hours[(d.getUTCDay() + 6) % 7];
  };
  const h = get(today);
  if (h && minute >= mins(h.open) && minute < mins(h.close))
    return {
      open: true,
      label:
        mins(h.close) - minute <= 30
          ? `Closing soon · ${time(h.close)}`
          : `Open until ${time(h.close)}`,
    };
  for (let n = 0; n < 15; n++) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() + n);
    const next = get(d);
    if (next && (n > 0 || minute < mins(next.open)))
      return {
        open: false,
        label: `Closed · opens ${n === 0 ? "today" : n === 1 ? "tomorrow" : days[(d.getUTCDay() + 6) % 7]} at ${time(next.open)}`,
      };
  }
  return { open: false, label: "Temporarily closed" };
}
export const directions = (l: Location) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${l.address}, ${l.city}, ${l.state} ${l.zip}`)}`;
export const phone = (l: Location) => `tel:+1${l.phone.replace(/\D/g, "")}`;
