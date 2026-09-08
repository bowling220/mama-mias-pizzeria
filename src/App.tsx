import {
  createContext,
  Component,
  useContext,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type Dispatch,
  type SetStateAction,
  type ReactNode,
} from "react";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowUpRight,
  ArrowRight,
  ShoppingBag,
  Menu as MenuIcon,
  X,
  Plus,
  Minus,
  Search,
  MapPin,
  Phone,
  Clock,
  Check,
  Heart,
} from "lucide-react";
import {
  money,
  extrasFor,
  sauces,
  dressings,
  unitPrice,
  type Item,
  type Line,
} from "./catalog";
import {
  days,
  time,
  status,
  directions,
  phone,
  type Location,
} from "./business";
import {
  MenuEditor,
  SpecialsEditor,
  ExpansionEditor,
  activeSpecials,
  type Special,
} from "./owner-tools";
type State = {
  menu: Item[];
  location: Location;
  announcement: string;
  admin: boolean;
  specials: Special[];
  locations: Location[];
};
type Order = {
  id: string;
  name: string;
  status: string;
  createdAt: string;
  subtotal: number;
  lines: {
    name: string;
    size: string;
    extras: string[];
    choice: string;
    notes: string;
    quantity: number;
    unit: number;
  }[];
};
type Message = {
  id: string;
  name: string;
  email: string;
  message: string;
  type: string;
};
async function api(action: string, data?: unknown) {
  const r = await fetch(`/api/app?action=${action}`, {
    method: data === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    ...(data === undefined ? {} : { body: JSON.stringify(data) }),
  });
  const b = await r.json();
  if (!r.ok) throw new Error(b.error || "Please try again.");
  return b;
}
const photo = "/hero-pizza.jpg";
function load<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || "null") || fallback;
  } catch {
    return fallback;
  }
}
function Intro({
  label,
  title,
  children,
}: {
  label: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="intro wrap">
      <span className="eyebrow">{label}</span>
      <h1>{title}</h1>
      {children && <p>{children}</p>}
    </section>
  );
}
function Gate({ enter }: { enter: (s: State) => void }) {
  const [pw, setPw] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("login", { password: pw });
      enter(await api("state"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="gate">
      <div className="gate-box">
        <div className="wordmark">
          Mama Mia’s<span>PIZZERIA · ERIE, PA</span>
        </div>
        <span className="eyebrow">A FRESH CHAPTER · PRIVATE PREVIEW</span>
        <h1>
          Good things
          <br />
          are in the oven.
        </h1>
        <p>
          Welcome to the next chapter of Mama Mia’s. Enter your preview password
          to explore.
        </p>
        <form onSubmit={submit}>
          <label>
            Preview password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Opening…" : "Enter the preview"} <ArrowRight size={18} />
          </button>
          {error && (
            <p role="alert" className="error">
              {error}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
function Modal({
  item,
  line,
  close,
  save,
}: {
  item: Item;
  line?: Line;
  close: () => void;
  save: (l: Line) => void;
}) {
  const [d, setD] = useState<Line>(
    line || {
      id: crypto.randomUUID(),
      itemId: item.id,
      size: 0,
      extras: [],
      choice: "",
      notes: "",
      quantity: 1,
    },
  );
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = ref.current!;
    dialog.showModal();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = prev;
    };
  }, []);
  const ex = extrasFor(item);
  const choices =
    item.category === "Wings"
      ? sauces
      : item.category === "Salads"
        ? dressings
        : item.category === "Snacks"
          ? [
              "M&M Chocolate Chip",
              "Reeses Pieces Peanut Butter",
              "White Chocolate Chip Macadamia Nut",
              "Oatmeal Raisin",
            ]
          : [];
  const large = /Large|14-inch/i.test(item.sizes[d.size].label);
  return (
    <dialog
      ref={ref}
      className="custom-dialog"
      onCancel={close}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(d);
        }}
      >
        <button
          type="button"
          className="icon close"
          aria-label="Close customizer"
          onClick={close}
        >
          <X />
        </button>
        <span className="eyebrow">MAKE IT YOURS</span>
        <h2>{item.name}</h2>
        <p>{item.description}</p>
        <fieldset>
          <legend>Size</legend>
          {item.sizes.map((s, i) => (
            <label className="option" key={s.label}>
              <input
                type="radio"
                name="size"
                checked={d.size === i}
                onChange={() => setD({ ...d, size: i })}
              />
              <span>{s.label}</span>
              <b>{money(s.cents)}</b>
            </label>
          ))}
        </fieldset>
        {choices.length > 0 && (
          <label>
            {item.category === "Wings"
              ? "Wing sauce"
              : item.category === "Salads"
                ? "Dressing"
                : "Flavor"}
            <select
              value={d.choice}
              required
              onChange={(e) => setD({ ...d, choice: e.target.value })}
            >
              <option value="">Choose one</option>
              {choices.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            {item.category === "Wings" && (
              <small>House, Honey Hot and Citrus Chipotle BBQ add $0.25.</small>
            )}
          </label>
        )}
        {ex.length > 0 && (
          <fieldset>
            <legend>Add a little extra</legend>
            <div className="extras">
              {ex.map((x) => (
                <label className="option" key={x.id}>
                  <input
                    type="checkbox"
                    checked={d.extras.includes(x.id)}
                    onChange={() =>
                      setD({
                        ...d,
                        extras: d.extras.includes(x.id)
                          ? d.extras.filter((v) => v !== x.id)
                          : [...d.extras, x.id],
                      })
                    }
                  />
                  <span>{x.label}</span>
                  <b>+{money(large ? x.large : x.small)}</b>
                </label>
              ))}
            </div>
          </fieldset>
        )}
        <label>
          Kitchen notes <small>Requests are subject to confirmation</small>
          <textarea
            maxLength={500}
            value={d.notes}
            onChange={(e) => setD({ ...d, notes: e.target.value })}
          />
        </label>
        <div className="modal-bottom">
          <div className="quantity">
            <button
              type="button"
              aria-label="Decrease quantity"
              disabled={d.quantity <= 1}
              onClick={() => setD({ ...d, quantity: d.quantity - 1 })}
            >
              <Minus size={16} />
            </button>
            <span>{d.quantity}</span>
            <button
              type="button"
              aria-label="Increase quantity"
              disabled={d.quantity >= 20}
              onClick={() => setD({ ...d, quantity: d.quantity + 1 })}
            >
              <Plus size={16} />
            </button>
          </div>
          <button className="button">
            {line ? "Save changes" : "Add to bag"} ·{" "}
            {money(unitPrice(item, d) * d.quantity)}
          </button>
        </div>
      </form>
    </dialog>
  );
}
function Inquiry({ type = "General" }: { type?: string }) {
  const [error, setError] = useState(""),
    [done, setDone] = useState(false),
    [busy, setBusy] = useState(false);
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      await api("messages", {
        name: f.get("name"),
        email: f.get("email"),
        message: f.get("message"),
        phone: f.get("phone"),
        website: f.get("website"),
        type,
      });
      setDone(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return done ? (
    <div className="notice">
      <Check />
      <h3>Your test inquiry is saved.</h3>
      <p>
        It is now in the owner dashboard inbox. No email was sent to the
        operating restaurant.
      </p>
      <button className="text-button" onClick={() => setDone(false)}>
        Write another message
      </button>
    </div>
  ) : (
    <form className="inquiry" onSubmit={submit}>
      <label>
        Phone (optional)
        <input type="tel" name="phone" maxLength={30} />
      </label>
      <label>
        Your name
        <input name="name" required maxLength={80} />
      </label>
      <label>
        Email address
        <input type="email" name="email" required maxLength={254} />
      </label>
      <label>
        Message
        <textarea name="message" required minLength={5} maxLength={3000} />
      </label>
      <label className="honeypot" aria-hidden="true">
        Leave empty
        <input name="website" tabIndex={-1} autoComplete="off" />
      </label>
      <button className="button" disabled={busy}>
        {busy ? "Saving…" : "Send test inquiry"} <ArrowUpRight size={17} />
      </button>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

type SiteContextValue = {
  data: State;
  setData: Dispatch<SetStateAction<State | null>>;
  menu: Item[];
  loc: Location;
  favorites: string[];
  cards: (items: Item[]) => ReactNode;
  cart: Line[];
  setCart: Dispatch<SetStateAction<Line[]>>;
  edit: (line: Line) => void;
  nav: ReturnType<typeof useNavigate>;
  path: ReturnType<typeof useLocation>;
  setToast: Dispatch<SetStateAction<string>>;
  open: ReturnType<typeof status>;
  active: Item[];
};
const SiteContext = createContext<SiteContextValue | null>(null);
function useSite() {
  return useContext(SiteContext)!;
}

function Site() {
  const [data, setData] = useState<State | null>(null),
    [loading, setLoading] = useState(true),
    [cart, setCart] = useState<Line[]>(() => {
      const v = load<Line[]>("mm-bag-v2", []);
      return Array.isArray(v)
        ? v.filter(
            (x) =>
              x &&
              typeof x.itemId === "string" &&
              typeof x.id === "string" &&
              Number.isInteger(x.size) &&
              x.size >= 0 &&
              Number.isInteger(x.quantity) &&
              x.quantity > 0 &&
              x.quantity <= 20 &&
              Array.isArray(x.extras),
          )
        : [];
    }),
    [selected, setSelected] = useState<Item | null>(null),
    [editing, setEditing] = useState<Line | undefined>(),
    [mobile, setMobile] = useState(false),
    [toast, setToast] = useState(""),
    [favorites, setFavorites] = useState<string[]>(() => {
      const v = load<unknown>("mm-favorites", []);
      return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
    }),
    [now, setNow] = useState(new Date());
  const path = useLocation();
  const nav = useNavigate();
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    api("state")
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    window.scrollTo(0, 0);
    setMobile(false);
    document.title = `${path.pathname === "/home" || path.pathname === "/" ? "Erie pizza since 1980" : path.pathname.split("/")[1].replace(/-/g, " ")} · Mama Mia’s Preview`;
  }, [path.pathname]);
  useEffect(() => {
    try {
      localStorage.setItem("mm-bag-v2", JSON.stringify(cart));
    } catch {
      /* Storage may be unavailable in private browsers. */
    }
  }, [cart]);
  useEffect(() => {
    try {
      localStorage.setItem("mm-favorites", JSON.stringify(favorites));
    } catch {
      /* Favorites remain available for this visit. */
    }
  }, [favorites]);
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(""), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);
  if (loading)
    return (
      <main className="gate">
        <p>Warming up the oven…</p>
      </main>
    );
  if (!data) return <Gate enter={setData} />;
  const { menu, location: loc } = data;
  const count = cart.reduce((s, l) => s + l.quantity, 0);
  const active = menu.filter((i) => i.available);
  const open = status(loc, now);
  const add = (item: Item) => {
    setEditing(undefined);
    setSelected(item);
  };
  const edit = (line: Line) => {
    const item = menu.find((i) => i.id === line.itemId);
    if (!item?.sizes[line.size]) {
      setToast("This item changed. Remove it and choose it again.");
      return;
    }
    setEditing(line);
    setSelected(menu.find((i) => i.id === line.itemId) || null);
  };
  const save = (line: Line) => {
    setCart((v) =>
      editing ? v.map((l) => (l.id === line.id ? line : l)) : [...v, line],
    );
    setSelected(null);
    setToast(editing ? "Your bag is updated." : "Added to your bag.");
    setEditing(undefined);
  };
  const toggle = (id: string) =>
    setFavorites((v) =>
      v.includes(id) ? v.filter((x) => x !== id) : [...v, id],
    );
  const cards = (items: Item[]) =>
    items.map((i) => (
      <article
        className={"menu-card " + (!i.available ? "unavailable" : "")}
        key={i.id}
      >
        <div className="card-top">
          <span className="eyebrow">{i.category}</span>
          <button
            className="icon"
            aria-label={`Favorite ${i.name}`}
            aria-pressed={favorites.includes(i.id)}
            onClick={() => toggle(i.id)}
          >
            <Heart
              size={19}
              fill={favorites.includes(i.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
        <h3>{i.name}</h3>
        <p>{i.description}</p>
        <div className="card-bottom">
          <b>
            {i.sizes.length > 0
              ? `${i.sizes.length > 1 ? "From " : ""}${money(i.sizes[0].cents)}`
              : "Unavailable"}
          </b>
          <button
            className="round"
            aria-label={`Customize ${i.name}`}
            disabled={!i.available || !i.sizes.length}
            onClick={() => add(i)}
          >
            <Plus size={22} />
          </button>
        </div>
        {!i.available && <small>Temporarily unavailable</small>}
      </article>
    ));
  return (
    <SiteContext.Provider
      value={{
        data,
        setData,
        menu,
        loc,
        favorites,
        cards,
        cart,
        setCart,
        edit,
        nav,
        path,
        setToast,
        open,
        active,
      }}
    >
      <a className="skip" href="#main">
        Skip to content
      </a>
      <div className="preview-strip">
        <span>TAKEOVER PREVIEW · TEST ORDERS ONLY</span>
        <Link to="/admin">
          Owner dashboard <ArrowUpRight size={12} />
        </Link>
      </div>
      {data.announcement && (
        <div className="announcement">{data.announcement}</div>
      )}
      <header>
        <Link className="wordmark" to="/home">
          Mama Mia’s<span>PIZZERIA · ERIE, PA</span>
        </Link>
        <nav className={mobile ? "expanded" : ""} aria-label="Main navigation">
          {[
            ["Menu", "/menu"],
            ["Our story", "/our-story"],
            ["Locations", "/locations"],
            ["Contact", "/contact"],
          ].map(([label, url]) => (
            <NavLink key={url} to={url}>
              {label}
            </NavLink>
          ))}
          <Link to="/order" className="button small">
            Order now <ArrowUpRight size={16} />
          </Link>
        </nav>
        <Link
          className="bag-icon"
          to="/order"
          aria-label={`Shopping bag, ${count} items`}
        >
          <ShoppingBag size={21} />
          <span>{count}</span>
        </Link>
        <button
          className="icon hamburger"
          aria-label="Toggle navigation"
          aria-expanded={mobile}
          onClick={() => setMobile(!mobile)}
        >
          {mobile ? <X /> : <MenuIcon />}
        </button>
      </header>
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/order" element={<Bag />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/orders/:id" element={<Orders />} />
          <Route path="/admin" element={<Owner />} />
          <Route
            path="/our-story"
            element={
              <>
                <Intro
                  label="ERIE, THROUGH AND THROUGH"
                  title="Since 1980. Still your neighborhood pizza."
                >
                  Good pizza brings people together. That part never changes.
                </Intro>
                <section className="story-block wrap">
                  <div className="year-art">
                    19
                    <br />
                    80<span>OUR STORY STARTS IN ERIE.</span>
                  </div>
                  <div>
                    <h2>
                      A familiar name.
                      <br />A fresh chapter.
                    </h2>
                    <p>
                      Mama Mia’s has been part of Erie since 1980, with fresh
                      dough, homemade sauces and house-made dressings at the
                      heart of its menu.
                    </p>
                    <div className="timeline">
                      <article>
                        <b>1980</b>
                        <p>Mama Mia’s begins serving Erie.</p>
                      </article>
                      <article>
                        <b>2019</b>
                        <p>
                          A May 14 plaza fire affects the former Peach Street
                          shop. Mama Mia’s reopens on West 38th Street on
                          November 7.
                        </p>
                      </article>
                      <article>
                        <b>Today</b>
                        <p>
                          Find the shop at {loc.address}. Explore the new
                          website as we prepare for the next chapter.
                        </p>
                      </article>
                    </div>
                    <Link className="text-button" to="/locations">
                      Find the Erie shop <ArrowUpRight size={17} />
                    </Link>
                  </div>
                </section>
              </>
            }
          />
          <Route path="/locations" element={<LocationsPage />} />
          <Route path="/locations/:slug" element={<LocationPage />} />
          <Route path="/specials" element={<SpecialsPage />} />
          <Route
            path="/contact"
            element={
              <>
                <Intro label="LET’S TALK" title="Drop us a line.">
                  Questions, feedback, or a hello from the neighborhood.
                </Intro>
                <section className="contact-grid wrap">
                  <div>
                    <h2>We’d love to hear it.</h2>
                    <p>
                      This preview sends inquiries to the new owner dashboard.
                    </p>
                    <a className="text-button" href={phone(loc)}>
                      <Phone size={18} />
                      {loc.phone}
                    </a>
                    <a className="text-button" href={directions(loc)}>
                      <MapPin size={18} />
                      {loc.address}, Erie, PA
                    </a>
                    <Link className="text-button" to="/locations">
                      Hours & directions <ArrowUpRight size={18} />
                    </Link>
                  </div>
                  <Inquiry />
                </section>
              </>
            }
          />
          <Route
            path="/franchise"
            element={
              <>
                <Intro label="LOOKING AHEAD" title="A little more Mama Mia’s.">
                  A neighborhood pizza shop has a way of bringing people
                  together. We’re exploring the next places that could happen.
                </Intro>
                <section className="contact-grid wrap">
                  <div>
                    <h2>Start a conversation.</h2>
                    <p>
                      Tell us about your area, experience and interest. This is
                      an early expression of interest; franchise terms and
                      availability have not been established.
                    </p>
                  </div>
                  <Inquiry type="Expansion interest" />
                </section>
              </>
            }
          />
          <Route
            path="/privacy"
            element={
              <>
                <Intro label="PRIVACY" title="A note about your data." />
                <article className="prose wrap">
                  <p>
                    The preview stores your bag and favorites in this browser.
                    Test orders and inquiries are saved in a Firebase database
                    and are accessible to the preview owner. A session cookie
                    keeps your preview unlocked for seven days.
                  </p>
                  <p>
                    No payment details are collected. Do not enter sensitive
                    information in test orders. Third-party map and font
                    services may receive connection information. Contact the
                    preview owner to request deletion of test records.
                  </p>
                </article>
              </>
            }
          />
          <Route
            path="/accessibility"
            element={
              <>
                <Intro label="ACCESSIBILITY" title="Everyone’s welcome." />
                <article className="prose wrap">
                  <p>
                    The site supports keyboard navigation, visible focus,
                    screen-reader labels, responsive text and reduced motion.
                    The menu customizer can be closed with Escape. Please share
                    accessibility feedback through the contact form.
                  </p>
                  <Link className="button" to="/contact">
                    Share feedback
                  </Link>
                </article>
              </>
            }
          />
          <Route
            path="*"
            element={
              <Intro label="404 · A WRONG TURN" title="This slice is missing.">
                <Link className="button" to="/home">
                  Back to home <ArrowRight size={18} />
                </Link>
              </Intro>
            }
          />
        </Routes>
      </main>
      <footer>
        <div className="wrap footer-main">
          <div>
            <Link to="/home" className="wordmark">
              Mama Mia’s<span>PIZZERIA · ERIE, PA</span>
            </Link>
            <p>
              Good pizza. Good neighbors.
              <br />
              Serving Erie since 1980.
            </p>
          </div>
          <div>
            <h3>Get hungry.</h3>
            <Link to="/menu">Menu</Link>
            <Link to="/order">Your bag</Link>
            <Link to="/orders">Test orders</Link>
            <Link to="/specials">Specials</Link>
          </div>
          <div>
            <h3>Come on over.</h3>
            <Link to="/locations">Locations & hours</Link>
            <Link to="/our-story">Our story</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h3>Erie, PA</h3>
            <p>
              {loc.address}
              <br />
              Erie, PA 16508
            </p>
            <a href={phone(loc)}>{loc.phone}</a>
          </div>
        </div>
        <div className="wrap footer-bottom">
          <span>© {new Date().getFullYear()} Mama Mia’s · Private preview</span>
          <Link to="/privacy">Privacy</Link>
          <Link to="/accessibility">Accessibility</Link>
          <button
            onClick={async () => {
              await api("logout", {});
              setData(null);
            }}
          >
            Lock preview
          </button>
        </div>
      </footer>
      <div className="mobile-order">
        <Link to="/menu">Menu</Link>
        <Link to="/order">
          Your bag · {count} <ShoppingBag size={16} />
        </Link>
      </div>
      {selected && (
        <Modal
          item={selected}
          line={editing}
          close={() => setSelected(null)}
          save={save}
        />
      )}{" "}
      {toast && (
        <div className="toast" role="status">
          <Check size={18} />
          {toast}
          <Link to="/order">View bag →</Link>
        </div>
      )}
    </SiteContext.Provider>
  );
}
class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <main className="gate">
        <div className="gate-box">
          <span className="eyebrow">A LITTLE OVEN TROUBLE</span>
          <h1>Let’s try that again.</h1>
          <p>The page couldn’t load. Your saved bag stays in this browser.</p>
          <a className="button" href="/home">
            Reload the preview
          </a>
        </div>
      </main>
    ) : (
      this.props.children
    );
  }
}
export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Site />
      </BrowserRouter>
    </ErrorBoundary>
  );
}

function MenuPage() {
  const { menu, favorites, cards } = useSite();
  const [category, setCategory] = useState("All"),
    [search, setSearch] = useState(""),
    [favs, setFavs] = useState(false);
  const filtered = menu.filter(
    (i) =>
      (category === "All" || i.category === category) &&
      (!favs || favorites.includes(i.id)) &&
      `${i.name} ${i.description}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <Intro label="THE GOOD STUFF" title="Find your favorite.">
        From your first slice to the last pepperoni ball. Make it yours.
      </Intro>
      <div className="menu-layout wrap">
        <aside>
          <span className="eyebrow">ON THE MENU</span>
          {["All", ...new Set(menu.map((i) => i.category))].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              className={category === c ? "active" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
              <span>
                {c === "All"
                  ? menu.length
                  : menu.filter((i) => i.category === c).length}
              </span>
            </button>
          ))}
        </aside>
        <section>
          <div className="filter-row">
            <label className="search">
              <Search size={19} />
              <input
                aria-label="Search menu"
                placeholder="Pizza, pepperoni balls, your usual…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <button
              className="icon"
              aria-label="Show favorites"
              aria-pressed={favs}
              onClick={() => setFavs(!favs)}
            >
              <Heart fill={favs ? "currentColor" : "none"} />
            </button>
          </div>
          <p className="result-count">
            {filtered.length} items · Menu prices last checked September 8, 2026
          </p>
          <div className="menu-grid">{cards(filtered)}</div>
          {!filtered.length && (
            <div className="notice">
              <h3>No matches this time.</h3>
              <button
                className="text-button"
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                  setFavs(false);
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
function Bag() {
  const { cart, setCart, menu, nav, edit, loc } = useSite();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const requestId = useRef(crypto.randomUUID());
  const subtotal = cart.reduce((t, l) => {
    const i = menu.find((x) => x.id === l.itemId);
    return t + (i ? unitPrice(i, l) * l.quantity : 0);
  }, 0);
  async function checkout(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      const o = await api("orders", {
        lines: cart,
        name: f.get("name"),
        requestId: requestId.current,
      });
      setCart([]);
      nav("/orders/" + o.id);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <Intro label="YOUR BAG" title="Good choices.">
        Everything you picked, just how you like it.
      </Intro>
      <div className="bag-layout wrap">
        <section>
          {!cart.length ? (
            <div className="notice">
              <ShoppingBag />
              <h2>A little empty in here.</h2>
              <p>Your next favorite is waiting on the menu.</p>
              <Link className="button" to="/menu">
                Find dinner <ArrowRight size={18} />
              </Link>
            </div>
          ) : (
            cart.map((l) => {
              const i = menu.find((x) => x.id === l.itemId);
              return (
                <article className="bag-line" key={l.id}>
                  <div>
                    <h3>{i?.name || "Removed menu item"}</h3>
                    <p>
                      {i?.sizes[l.size]?.label} {l.choice && " · " + l.choice}
                    </p>
                    <p>{l.extras.join(", ")}</p>
                    {l.notes && <small>{l.notes}</small>}
                    <div className="line-actions">
                      <button className="text-button" onClick={() => edit(l)}>
                        Edit
                      </button>
                      <button
                        className="text-button"
                        onClick={() =>
                          setCart((v) => v.filter((x) => x.id !== l.id))
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div>
                    <b>
                      {i ? money(unitPrice(i, l) * l.quantity) : "Unavailable"}
                    </b>
                    <div className="quantity">
                      <button
                        aria-label={`Less ${i?.name}`}
                        disabled={l.quantity <= 1}
                        onClick={() =>
                          setCart((v) =>
                            v.map((x) =>
                              x.id === l.id
                                ? { ...x, quantity: x.quantity - 1 }
                                : x,
                            ),
                          )
                        }
                      >
                        <Minus size={14} />
                      </button>
                      {l.quantity}
                      <button
                        aria-label={`More ${i?.name}`}
                        disabled={l.quantity >= 20}
                        onClick={() =>
                          setCart((v) =>
                            v.map((x) =>
                              x.id === l.id
                                ? { ...x, quantity: x.quantity + 1 }
                                : x,
                            ),
                          )
                        }
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          )}
          <Link className="text-button" to="/menu">
            + Add something else
          </Link>
        </section>
        {cart.length > 0 && (
          <form className="checkout" onSubmit={checkout}>
            <span className="eyebrow">PICKUP · ERIE</span>
            <h2>The dinner plan.</h2>
            <p>
              {loc.address}
              <br />
              {loc.city}, {loc.state} {loc.zip}
            </p>
            <div className="total">
              <span>Food subtotal</span>
              <strong>{money(subtotal)}</strong>
            </div>
            <small>
              Test checkout only. Taxes and payment are not collected.
            </small>
            <label>
              Name for the test order
              <input name="name" required maxLength={80} />
            </label>
            <button className="button" disabled={busy}>
              {busy ? "Saving order…" : "Place test order"}{" "}
              <ArrowRight size={18} />
            </button>
            <p className="caption">
              Saved to the preview kitchen dashboard. No food is prepared or
              payment taken.
            </p>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </>
  );
}
function Orders() {
  const { path } = useSite();
  const [orders, setOrders] = useState<Order[]>([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  useEffect(() => {
    const refresh = () =>
      api("orders")
        .then(setOrders)
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    refresh();
    const t = setInterval(refresh, 15000);
    return () => clearInterval(t);
  }, []);
  const id = path.pathname.split("/")[2];
  const shown = id ? orders.filter((o) => o.id === id) : orders;
  return (
    <>
      <Intro
        label="PREVIEW KITCHEN"
        title={
          id && shown.length ? "Your test order is in." : "Your test orders."
        }
      >
        Follow the order from received to ready. These are test orders only.
      </Intro>
      <section className="wrap order-list">
        {error && <p role="alert">{error}</p>}
        {shown.map((o) => (
          <article className="order-card" key={o.id}>
            <div className="between">
              <span className="eyebrow">#{o.id.slice(0, 8)}</span>
              <b className="pill">{o.status}</b>
            </div>
            <h2>{o.name}</h2>
            <p>{new Date(o.createdAt).toLocaleString()}</p>
            <div className="progress">
              {["Received", "Preparing", "Ready", "Completed"].map((s) => (
                <span className={s === o.status ? "current" : ""} key={s}>
                  {s}
                </span>
              ))}
            </div>
            {o.lines.map((l, k) => (
              <p key={k}>
                {l.quantity} × {l.name} · {l.size}{" "}
                <b>{money(l.unit * l.quantity)}</b>
                {(l.choice || l.extras.length > 0 || l.notes) && (
                  <small className="line-details">
                    {[l.choice, ...l.extras, l.notes]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                )}
              </p>
            ))}
            <strong>Subtotal {money(o.subtotal)}</strong>
          </article>
        ))}
        {loading && <p role="status">Loading your test orders…</p>}
        {!loading && !shown.length && (
          <p>No test orders found in this session.</p>
        )}
        <Link to="/menu" className="button">
          Back to the menu
        </Link>
      </section>
    </>
  );
}
function Owner() {
  const { data, setData, setToast } = useSite();
  const [pw, setPw] = useState(""),
    [tab, setTab] = useState("Orders"),
    [orders, setOrders] = useState<Order[]>([]),
    [messages, setMessages] = useState<Message[]>([]),
    [draft, setDraft] = useState(data!),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [specialDate, setSpecialDate] = useState("");
  useEffect(() => {
    if (data!.admin) {
      api("orders")
        .then(setOrders)
        .catch((e) => setError(e.message));
      api("messages")
        .then(setMessages)
        .catch((e) => setError(e.message));
      const timer = setInterval(() => {
        api("orders")
          .then(setOrders)
          .catch((e) => setError(e.message));
      }, 15000);
      return () => clearInterval(timer);
    }
  }, [data.admin]);
  async function login(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api("login", { password: pw, admin: true });
      setData(await api("state"));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function saveSettings() {
    setBusy(true);
    setError("");
    try {
      await api("settings", draft);
      setData(await api("state"));
      setToast("Changes published to the preview.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (!data!.admin)
    return (
      <div className="wrap owner-login">
        <Intro label="OWNER ACCESS" title="Behind the counter." />
        <form onSubmit={login}>
          <label>
            Owner password
            <input
              type="password"
              required
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
          </label>
          <button className="button" disabled={busy}>
            Sign in
          </button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    );
  return (
    <>
      <Intro label="OWNER DASHBOARD" title="Behind the counter.">
        Manage the preview restaurant. Changes are saved in Firebase.
      </Intro>
      <div className="wrap dashboard">
        <div className="tabs">
          {[
            "Orders",
            "Menu",
            "Hours & location",
            "Announcements",
            "Specials",
            "Expansion",
            "Inbox",
          ].map((t) => (
            <button
              className={tab === t ? "active" : ""}
              key={t}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {tab === "Orders" && (
          <>
            <div className="between">
              <h2>Test kitchen</h2>
              <button
                className="text-button"
                onClick={() =>
                  api("orders")
                    .then(setOrders)
                    .catch((e) => setError(e.message))
                }
              >
                Refresh orders
              </button>
            </div>
            {orders.map((o) => (
              <article className="owner-row" key={o.id}>
                <div>
                  <b>
                    {o.name} · #{o.id.slice(0, 8)}
                  </b>
                  {o.lines.map((l, k) => (
                    <p key={k}>
                      <b>
                        {l.quantity} × {l.name} · {l.size}
                      </b>
                      <br />
                      {[l.choice, ...l.extras, l.notes]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  ))}
                  <small>
                    {money(o.subtotal)} ·{" "}
                    {new Date(o.createdAt).toLocaleString()}
                  </small>
                </div>
                <select
                  aria-label={`Status for ${o.name}`}
                  value={o.status}
                  onChange={async (e) => {
                    try {
                      await api("order-status", {
                        id: o.id,
                        status: e.target.value,
                      });
                      setOrders(await api("orders"));
                    } catch (e) {
                      setError((e as Error).message);
                    }
                  }}
                >
                  {[
                    "Received",
                    "Preparing",
                    "Ready",
                    "Completed",
                    "Cancelled",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </article>
            ))}
            {!orders.length && (
              <p>The kitchen is clear. Place a test order from the menu.</p>
            )}
          </>
        )}
        {tab === "Menu" && (
          <>
            <MenuEditor
              menu={draft.menu}
              onChange={(menu) => setDraft({ ...draft, menu })}
            />
            <button className="button" disabled={busy} onClick={saveSettings}>
              Save menu changes
            </button>
          </>
        )}
        {tab === "Specials" && (
          <>
            <SpecialsEditor
              value={draft.specials}
              onChange={(specials) => setDraft({ ...draft, specials })}
            />
            <button className="button" disabled={busy} onClick={saveSettings}>
              Save specials
            </button>
          </>
        )}
        {tab === "Expansion" && (
          <>
            <ExpansionEditor
              locations={draft.locations}
              onChange={(locations) => setDraft({ ...draft, locations })}
            />
            <button className="button" disabled={busy} onClick={saveSettings}>
              Save additional locations
            </button>
          </>
        )}
        {tab === "Hours & location" && (
          <div className="settings-form">
            <h2>Erie location</h2>
            {(["address", "city", "state", "zip", "phone"] as const).map(
              (key) => (
                <label key={key}>
                  {key}
                  <input
                    value={draft.location[key]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        location: { ...draft.location, [key]: e.target.value },
                      })
                    }
                  />
                </label>
              ),
            )}
            {days.map((day, k) => (
              <div className="owner-row" key={day}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!draft.location.hours[k]}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        location: {
                          ...draft.location,
                          hours: draft.location.hours.map((h, n) =>
                            n === k
                              ? e.target.checked
                                ? { open: "16:00", close: "20:00" }
                                : null
                              : h,
                          ),
                        },
                      })
                    }
                  />{" "}
                  {day}
                </label>
                {draft.location.hours[k] && (
                  <>
                    {(["open", "close"] as const).map((v) => (
                      <label key={v}>
                        {v}
                        <input
                          type="time"
                          value={draft.location.hours[k]![v]}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              location: {
                                ...draft.location,
                                hours: draft.location.hours.map((h, n) =>
                                  n === k ? { ...h!, [v]: e.target.value } : h,
                                ),
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                  </>
                )}
              </div>
            ))}
            {(["carryout", "delivery", "dineIn"] as const).map((key) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={draft.location[key]}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      location: { ...draft.location, [key]: e.target.checked },
                    })
                  }
                />{" "}
                {key}
              </label>
            ))}
            <h3>Holiday & special hours</h3>
            <p>Overrides replace the normal schedule for a specific date.</p>
            <label>
              Special date
              <input
                type="date"
                value={specialDate}
                onChange={(e) => setSpecialDate(e.target.value)}
              />
            </label>
            <button
              className="text-button"
              disabled={!specialDate}
              onClick={() => {
                setDraft({
                  ...draft,
                  location: {
                    ...draft.location,
                    specialHours: {
                      ...draft.location.specialHours,
                      [specialDate]: null,
                    },
                  },
                });
                setSpecialDate("");
              }}
            >
              Add date override
            </button>
            {Object.entries(draft.location.specialHours)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, h]) => (
                <div className="owner-row" key={date}>
                  <b>{date}</b>
                  <label>
                    <input
                      type="checkbox"
                      checked={!!h}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          location: {
                            ...draft.location,
                            specialHours: {
                              ...draft.location.specialHours,
                              [date]: e.target.checked
                                ? { open: "16:00", close: "20:00" }
                                : null,
                            },
                          },
                        })
                      }
                    />{" "}
                    Open
                  </label>
                  {h &&
                    (["open", "close"] as const).map((key) => (
                      <label key={key}>
                        {key}
                        <input
                          type="time"
                          value={h[key]}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              location: {
                                ...draft.location,
                                specialHours: {
                                  ...draft.location.specialHours,
                                  [date]: { ...h, [key]: e.target.value },
                                },
                              },
                            })
                          }
                        />
                      </label>
                    ))}
                  <button
                    className="text-button"
                    onClick={() => {
                      const next = { ...draft.location.specialHours };
                      delete next[date];
                      setDraft({
                        ...draft,
                        location: { ...draft.location, specialHours: next },
                      });
                    }}
                  >
                    Remove override
                  </button>
                </div>
              ))}
            <button className="button" disabled={busy} onClick={saveSettings}>
              Save location
            </button>
          </div>
        )}
        {tab === "Announcements" && (
          <div className="settings-form">
            <h2>What’s new at Mama Mia’s?</h2>
            <label>
              Announcement banner
              <textarea
                maxLength={200}
                value={draft.announcement}
                onChange={(e) =>
                  setDraft({ ...draft, announcement: e.target.value })
                }
              />
            </label>
            <p>Leave blank to hide the banner.</p>
            <button className="button" disabled={busy} onClick={saveSettings}>
              Save announcement
            </button>
          </div>
        )}
        {tab === "Inbox" && (
          <>
            <h2>Test inquiries</h2>
            {messages.map((m) => (
              <article className="owner-row" key={m.id}>
                <div>
                  <span className="eyebrow">{m.type}</span>
                  <h3>{m.name}</h3>
                  <p>{m.email}</p>
                  <p>{m.message}</p>
                </div>
              </article>
            ))}
            {!messages.length && <p>No inquiries yet.</p>}
          </>
        )}
      </div>
    </>
  );
}
function HoursList({ loc }: { loc: Location }) {
  return (
    <div className="hours">
      <h3>Come hungry.</h3>
      {days.map((d, i) => (
        <div key={d}>
          <span>{d}</span>
          <b>
            {loc.hours[i]
              ? `${time(loc.hours[i]!.open)} – ${time(loc.hours[i]!.close)}`
              : "Closed"}
          </b>
        </div>
      ))}
      {Object.entries(loc.specialHours)
        .filter(([d]) => d >= new Date().toISOString().slice(0, 10))
        .map(([d, h]) => (
          <div key={d}>
            <span>{d}</span>
            <b>{h ? `${time(h.open)} – ${time(h.close)}` : "Closed"}</b>
          </div>
        ))}
    </div>
  );
}
function LocationsPage() {
  const { data, loc } = useSite();
  return (
    <>
      <Intro label="YOUR NEXT PIZZA STOP" title="Find your Mama Mia’s.">
        It all starts in Erie.
      </Intro>
      <section className="location-grid wrap">
        {[loc, ...data.locations].map((l) => (
          <div className="location-card" key={l.id}>
            <span className="eyebrow">
              {l.city}, {l.state}
            </span>
            <h2>{l.name}</h2>
            <p>
              {l.address}
              <br />
              {l.city}, {l.state} {l.zip}
            </p>
            <span className="status">{status(l).label}</span>
            <p>
              {[
                l.carryout && "Carryout",
                l.delivery && "Delivery",
                l.dineIn && "Dine-in",
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <Link className="button" to={"/locations/" + l.slug}>
              View location <ArrowUpRight size={18} />
            </Link>
          </div>
        ))}
      </section>
      <section className="growth wrap">
        <span className="eyebrow">THE NEXT CHAPTER</span>
        <h2>
          More neighborhoods.
          <br />
          Same Mama Mia’s spirit.
        </h2>
        <p>
          We’re exploring what growth could look like. Share your interest in a
          future location.
        </p>
        <Link to="/franchise" className="button light">
          Explore the opportunity <ArrowUpRight size={18} />
        </Link>
      </section>
    </>
  );
}
function LocationPage() {
  const { data, loc } = useSite();
  const { slug } = useParams();
  const l = [loc, ...data.locations].find((x) => x.slug === slug);
  if (!l)
    return (
      <Intro label="LOCATION NOT FOUND" title="Let’s find your shop.">
        <Link to="/locations" className="button">
          All locations
        </Link>
      </Intro>
    );
  return (
    <>
      <Intro label={`${l.city} · ${l.state}`} title={l.name}>
        {status(l).label}
      </Intro>
      <section className="location-grid wrap">
        <div className="location-card">
          <h2>{l.address}</h2>
          <p>
            {l.city}, {l.state} {l.zip}
          </p>
          <a
            className="button"
            href={directions(l)}
            target="_blank"
            rel="noreferrer"
          >
            Get directions <MapPin size={18} />
          </a>
          <a className="text-button" href={phone(l)}>
            {l.phone} <Phone size={18} />
          </a>
          {l.id === loc.id && (
            <Link className="text-button" to="/menu">
              Explore this menu <ArrowRight size={18} />
            </Link>
          )}
        </div>
        <HoursList loc={l} />
      </section>
      <div className="wrap map-wrap">
        <iframe
          title={`Map to ${l.name}`}
          loading="lazy"
          referrerPolicy="no-referrer"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(l.address + ", " + l.city + ", " + l.state + " " + l.zip)}&output=embed`}
        />
      </div>
    </>
  );
}
function SpecialsPage() {
  const { data } = useSite();
  const specials = activeSpecials(data.specials);
  return (
    <>
      <Intro label="A LITTLE SOMETHING EXTRA" title="What’s cooking.">
        The latest from Mama Mia’s.
      </Intro>
      <section className="wrap order-list">
        {specials.length ? (
          specials.map((s) => (
            <article className="order-card" key={s.id}>
              <h2>{s.title}</h2>
              <p>{s.description}</p>
              {s.end && <small>Through {s.end}</small>}
              <p>
                <Link className="text-button" to="/menu">
                  Explore the menu <ArrowRight size={18} />
                </Link>
              </p>
            </article>
          ))
        ) : (
          <div className="notice">
            <h2>The classics are always a good idea.</h2>
            <p>
              No specials are posted right now. Find your usual on the full
              menu.
            </p>
            <Link className="button" to="/menu">
              View menu
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
function Home() {
  const { open, loc, cards, active } = useSite();
  return (
    <>
      <section className="home-hero wrap">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="green-dot" /> ERIE’S NEIGHBORHOOD PIZZERIA
          </span>
          <h1>
            Made here.
            <br />
            Loved here.
            <br />
            <em>Since 1980.</em>
          </h1>
          <p>
            The familiar favorites. The house-made sauce.
            <br />
            The kind of pizza you make plans around.
          </p>
          <div className="hero-buttons">
            <Link className="button" to="/menu">
              Find your favorite <ArrowUpRight size={19} />
            </Link>
            <Link className="text-button" to="/our-story">
              Our story <ArrowRight size={17} />
            </Link>
          </div>
          <div className="hero-status">
            <Clock size={16} />
            {open.label}
          </div>
        </div>
        <figure className="hero-photo">
          <img
            src={photo}
            alt="Illustrative pepperoni pizza"
            fetchPriority="high"
            width={1200}
            height={1200}
            onError={(e) => {
              e.currentTarget.style.display = "none";
              e.currentTarget.parentElement!.classList.add("photo-fallback");
            }}
          />
          <div className="seal">
            ERIE, PA<strong>1980</strong>THE ORIGINAL
          </div>
          <figcaption>
            Illustrative photography · Mama Mia’s photos coming next
          </figcaption>
        </figure>
      </section>
      <div className="ticker">
        <span>FRESH DOUGH</span>✳<span>HOMEMADE SAUCE</span>✳
        <span>ERIE SINCE 1980</span>✳<span>YOUR NEIGHBORHOOD FAVORITE</span>
      </div>
      <section className="favorites wrap">
        <div className="section-title">
          <div>
            <span className="eyebrow">START WITH THE GOOD STUFF</span>
            <h2>
              The usuals.
              <br />
              For a reason.
            </h2>
          </div>
          <Link className="text-button" to="/menu">
            The whole menu <ArrowUpRight size={20} />
          </Link>
        </div>
        <div className="featured-grid">
          {cards(active.filter((i) => i.featured))}
        </div>
      </section>
      <section className="home-story wrap">
        <span className="big-year">1980</span>
        <div>
          <span className="eyebrow">SOME THINGS JUST FEEL LIKE HOME.</span>
          <h2>
            Same Erie heart.
            <br />A fresh new chapter.
          </h2>
          <p>
            Mama Mia’s has been serving this city for decades. Now we’re getting
            ready for what’s next—with all the neighborhood spirit that brought
            us here.
          </p>
          <Link to="/our-story" className="button light">
            Meet Mama Mia’s <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>
      <section className="visit-home wrap">
        <div>
          <span className="eyebrow">DINNER’S NOT FAR.</span>
          <h2>
            Right here
            <br />
            on West 38th.
          </h2>
          <p>{loc.address} · Erie, PA 16508</p>
          <Link to="/locations" className="text-button">
            Hours & directions <ArrowUpRight size={18} />
          </Link>
        </div>
        <div className="dinner-stamp">
          <span>WHAT’S FOR DINNER?</span>
          <strong>
            Mama
            <br />
            Mia’s.
          </strong>
          <Link to="/menu">
            Let’s order <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </>
  );
}
