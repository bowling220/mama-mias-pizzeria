import { useState } from "react";
import { type Item } from "./catalog";
import { type Location } from "./business";
export type Special = {
  id: string;
  title: string;
  description: string;
  start: string;
  end: string;
};
export const activeSpecials = (list: Special[], now = new Date()) => {
  const d = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return list.filter(
    (s) => (!s.start || s.start <= d) && (!s.end || s.end >= d),
  );
};
export function MenuEditor({
  menu,
  onChange,
}: {
  menu: Item[];
  onChange: (items: Item[]) => void;
}) {
  const [q, setQ] = useState("");
  const update = (id: string, patch: Partial<Item>) =>
    onChange(menu.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  return (
    <>
      <div className="between">
        <h2>Menu editor</h2>
        <button
          className="text-button"
          onClick={() =>
            onChange([
              {
                id: crypto.randomUUID(),
                name: "New item",
                description: "",
                category: "Specialty Pizza",
                available: false,
                sizes: [],
              },
              ...menu,
            ])
          }
        >
          + Add menu item
        </button>
      </div>
      <label>
        Find an item
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by name"
        />
      </label>
      <p>Unpriced items stay unavailable. Save when your changes are ready.</p>
      {menu
        .filter((i) => i.name.toLowerCase().includes(q.toLowerCase()))
        .map((i) => (
          <details className="editor-item" key={i.id}>
            <summary>
              {i.name}{" "}
              <span>
                {i.available ? "Available" : "Unavailable"}
                {i.featured ? " · Featured" : ""}
              </span>
            </summary>
            <div className="editor-fields">
              <label>
                Item name
                <input
                  value={i.name}
                  onChange={(e) => update(i.id, { name: e.target.value })}
                />
              </label>
              <label>
                Category
                <input
                  list="categories"
                  value={i.category}
                  onChange={(e) => update(i.id, { category: e.target.value })}
                />
              </label>
              <label>
                Description
                <textarea
                  value={i.description}
                  maxLength={600}
                  onChange={(e) =>
                    update(i.id, { description: e.target.value })
                  }
                />
              </label>
              <div className="between">
                <label>
                  <input
                    type="checkbox"
                    disabled={!i.sizes.length}
                    checked={i.available}
                    onChange={(e) =>
                      update(i.id, { available: e.target.checked })
                    }
                  />{" "}
                  Available
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={!!i.featured}
                    onChange={(e) =>
                      update(i.id, { featured: e.target.checked })
                    }
                  />{" "}
                  Featured on homepage
                </label>
              </div>
              {i.sizes.map((s, k) => (
                <div className="owner-row" key={k}>
                  <label>
                    Size label
                    <input
                      value={s.label}
                      onChange={(e) =>
                        update(i.id, {
                          sizes: i.sizes.map((v, n) =>
                            n === k ? { ...v, label: e.target.value } : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <label>
                    Price ($)
                    <input
                      type="number"
                      min="0"
                      max="1000"
                      step=".01"
                      value={s.cents / 100}
                      onChange={(e) =>
                        update(i.id, {
                          sizes: i.sizes.map((v, n) =>
                            n === k
                              ? {
                                  ...v,
                                  cents: Math.round(
                                    Number(e.target.value) * 100,
                                  ),
                                }
                              : v,
                          ),
                        })
                      }
                    />
                  </label>
                  <button
                    className="text-button"
                    onClick={() =>
                      update(i.id, {
                        sizes: i.sizes.filter((_, n) => n !== k),
                        ...(i.sizes.length === 1 ? { available: false } : {}),
                      })
                    }
                  >
                    Remove size
                  </button>
                </div>
              ))}
              <button
                className="text-button"
                onClick={() =>
                  update(i.id, {
                    sizes: [...i.sizes, { label: "Regular", cents: 0 }],
                    available: false,
                  })
                }
              >
                + Add priced size
              </button>
              <small>
                Category-based toppings are inherited from the published menu.
                Review these before enabling new products.
              </small>
            </div>
          </details>
        ))}
      <datalist id="categories">
        {[...new Set(menu.map((i) => i.category))].map((c) => (
          <option key={c}>{c}</option>
        ))}
      </datalist>
    </>
  );
}
export function SpecialsEditor({
  value,
  onChange,
}: {
  value: Special[];
  onChange: (v: Special[]) => void;
}) {
  const update = (id: string, p: Partial<Special>) =>
    onChange(value.map((s) => (s.id === id ? { ...s, ...p } : s)));
  return (
    <>
      <h2>Scheduled specials</h2>
      <p>
        Only specials within their scheduled dates appear. No offers are
        published by default.
      </p>
      {value.map((s) => (
        <div className="editor-item editor-fields" key={s.id}>
          <label>
            Title
            <input
              value={s.title}
              onChange={(e) => update(s.id, { title: e.target.value })}
            />
          </label>
          <label>
            Details
            <textarea
              value={s.description}
              onChange={(e) => update(s.id, { description: e.target.value })}
            />
          </label>
          <div className="between">
            <label>
              Starts
              <input
                type="date"
                value={s.start}
                onChange={(e) => update(s.id, { start: e.target.value })}
              />
            </label>
            <label>
              Ends
              <input
                type="date"
                min={s.start}
                value={s.end}
                onChange={(e) => update(s.id, { end: e.target.value })}
              />
            </label>
          </div>
          <button
            className="text-button"
            onClick={() => onChange(value.filter((x) => x.id !== s.id))}
          >
            Remove special
          </button>
        </div>
      ))}
      <button
        className="text-button"
        onClick={() =>
          onChange([
            ...value,
            {
              id: crypto.randomUUID(),
              title: "",
              description: "",
              start: "",
              end: "",
            },
          ])
        }
      >
        + Add special
      </button>
    </>
  );
}
export function ExpansionEditor({
  locations,
  onChange,
}: {
  locations: Location[];
  onChange: (v: Location[]) => void;
}) {
  return (
    <>
      <h2>Future locations</h2>
      <p>
        The Erie shop is managed under Hours & location. Add only confirmed
        locations here; saved locations appear in the directory.
      </p>
      {locations.map((l, k) => (
        <div className="editor-item editor-fields" key={l.id}>
          <h3>{l.name || "New location"}</h3>
          {(
            [
              "name",
              "slug",
              "address",
              "city",
              "state",
              "zip",
              "phone",
            ] as const
          ).map((key) => (
            <label key={key}>
              {key}
              <input
                value={l[key]}
                onChange={(e) =>
                  onChange(
                    locations.map((x, n) =>
                      n === k ? { ...x, [key]: e.target.value } : x,
                    ),
                  )
                }
              />
            </label>
          ))}
          <p>
            New shops start with no opening hours or services. Establish
            confirmed operations before publishing.
          </p>
          <button
            className="text-button"
            onClick={() => onChange(locations.filter((_, n) => n !== k))}
          >
            Remove location
          </button>
        </div>
      ))}
      <button
        className="text-button"
        onClick={() =>
          onChange([
            ...locations,
            {
              id: crypto.randomUUID(),
              slug: "",
              name: "",
              address: "",
              city: "",
              state: "PA",
              zip: "",
              phone: "",
              hours: [null, null, null, null, null, null, null],
              specialHours: {},
              carryout: false,
              delivery: false,
              dineIn: false,
            },
          ])
        }
      >
        + Add confirmed location
      </button>
    </>
  );
}
