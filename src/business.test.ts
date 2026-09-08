import { describe, it, expect } from "vitest";
import { location, status, phone, directions } from "./business";
import {
  catalog,
  unitPrice,
  extrasFor,
  choicesFor,
  type Line,
} from "./catalog";
describe("Eastern restaurant hours", () => {
  it("opens Wednesday after closed Monday and Tuesday", () =>
    expect(status(location, new Date("2026-09-08T12:00:00Z")).label).toContain(
      "tomorrow at 4 PM",
    ));
  it("opens exactly at four", () =>
    expect(status(location, new Date("2026-09-09T20:00:00Z")).open).toBe(true));
  it("closes exactly at eight", () =>
    expect(status(location, new Date("2026-09-10T00:00:00Z")).open).toBe(
      false,
    ));
  it("reports closing soon", () =>
    expect(status(location, new Date("2026-09-09T23:45:00Z")).label).toContain(
      "Closing soon",
    ));
  it("handles winter time", () =>
    expect(status(location, new Date("2026-12-09T21:00:00Z")).open).toBe(true));
  it("handles holiday closure", () =>
    expect(
      status(
        { ...location, specialHours: { "2026-09-09": null } },
        new Date("2026-09-09T21:00:00Z"),
      ).open,
    ).toBe(false));
  it("handles special opening on Monday", () =>
    expect(
      status(
        {
          ...location,
          specialHours: { "2026-09-07": { open: "12:00", close: "18:00" } },
        },
        new Date("2026-09-07T17:00:00Z"),
      ).open,
    ).toBe(true));
  it("uses current address and verified phone", () => {
    expect(phone(location)).toBe("tel:+18147905868");
    expect(decodeURIComponent(directions(location))).toContain(
      "1529 W 38th St",
    );
  });
});
describe("Menu pricing", () => {
  const pizza = catalog.find((x) => x.name === "Cheese Pizza")!;
  const line: Line = {
    id: "test",
    itemId: pizza.id,
    size: 0,
    extras: [],
    choice: "",
    notes: "",
    quantity: 1,
  };
  it("has unique IDs and integer prices", () => {
    expect(new Set(catalog.map((i) => i.id)).size).toBe(catalog.length);
    for (const i of catalog)
      for (const s of i.sizes)
        expect(Number.isInteger(s.cents) && s.cents >= 0).toBe(true);
  });
  it("uses small topping price", () =>
    expect(unitPrice(pizza, { ...line, extras: ["Pepperoni"] })).toBe(1049));
  it("uses large topping price", () =>
    expect(unitPrice(pizza, { ...line, size: 1, extras: ["Pepperoni"] })).toBe(
      1255,
    ));
  it("adds multiple extras", () =>
    expect(unitPrice(pizza, { ...line, extras: ["Pepperoni", "Bacon"] })).toBe(
      1224,
    ));
  it("does not double-charge repeated extras", () =>
    expect(
      unitPrice(pizza, { ...line, extras: ["Pepperoni", "Pepperoni"] }),
    ).toBe(1049));
  it("charges premium wing sauces", () => {
    const wings = catalog.find((x) => x.name === "Traditional Wings")!;
    expect(unitPrice(wings, { ...line, choice: "House" })).toBe(1324);
    expect(choicesFor(wings)).toContain("House");
  });
  it("keeps unsupported toppings out of subs", () =>
    expect(
      extrasFor(catalog.find((x) => x.category === "Subs")!).some(
        (x) => x.id === "Anchovies",
      ),
    ).toBe(false));
});
