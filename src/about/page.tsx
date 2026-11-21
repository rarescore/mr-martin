import { useEffect, useRef, useState, type FormEvent } from "react";
import { CartIcon, SiteMenu } from "@/martin/menu";
import { SiteFooter } from "@/site/footer";
import "../martin/page.css";
import "../site/site.css";
import "./page.css";

const STORY =
  "Mr. Martin starts with the row, not the flavor lab. Grade 1 striped seeds, roasted in small batches in California, with sea salt or with nothing at all. We crack a bag before it leaves. If the last seed isn't as loud as the first, it doesn't ship.";

const DIFFS = [
  {
    n: "01",
    t: "The seed",
    d: "Grade 1 striped sunflower seeds. If you can't picture it growing, it isn't in the bag.",
  },
  {
    n: "02",
    t: "Boots in the row",
    d: "We walk the fields we buy from. The roast starts with someone who knows which rows got the light.",
  },
  {
    n: "03",
    t: "The kettle",
    d: "Small batches in California. Hot enough to open the flavor. Never hot enough to scorch it.",
  },
  {
    n: "04",
    t: "Nothing extra",
    d: "Sea salt, alpine salt, or none at all. The list on the bag stays short on purpose.",
  },
];

const GOALS = [
  { n: "01", t: "A named field", d: "Every lot traces back to a valley we can point to." },
  { n: "02", t: "A slower roast", d: "Flavor before speed. The kettle is watched, not rushed." },
  { n: "03", t: "A fair bag", d: "A price that respects the grower and still feels like a snack." },
  { n: "04", t: "The next season", d: "More acres in rotation. Fewer shortcuts between the flower and the crack." },
];

const IMPACT = [
  {
    n: "01",
    t: "The field",
    img: "/about/hands.jpg",
    alt: "A farmer's hands checking a ripe sunflower head at sunset",
    d: "We buy Grade 1 seed from growers who rotate sunflowers with the land. If the row isn't right, it doesn't get roasted.",
    pack: false,
  },
  {
    n: "02",
    t: "The valley",
    img: "/about/rows.jpg",
    alt: "Sunflower rows along a dirt path in a California valley",
    d: "One valley, walked, not just ordered off a sheet. The late light here is the flavor.",
    pack: false,
  },
  {
    n: "03",
    t: "The bag",
    img: "/bags/jumbo-front.webp",
    alt: "Mr. Martin Premium Jumbo bag of salted roasted sunflower seeds",
    d: "Filled after the roast, sealed while it's still fragrant, resealable so the last seed cracks like the first.",
    pack: true,
  },
];

const TABS = [
  ["story", "Story"],
  ["differentiators", "Differentiators"],
  ["mission", "Mission"],
  ["field", "Field"],
  ["grow", "Grow"],
] as const;

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function sectionProgress(el: HTMLElement) {
  const total = el.offsetHeight - window.innerHeight;
  if (total <= 0) return 1;
  return clamp(-el.getBoundingClientRect().top / total, 0, 1);
}

function smoothScrollTo(el: HTMLElement) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) {
    el.scrollIntoView();
    return;
  }
  const startY = window.scrollY;
  const targetY = startY + el.getBoundingClientRect().top;
  const t0 = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / 900);
    const e = t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
    window.scrollTo(0, startY + (targetY - startY) * e);
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function AboutPage() {
  const [tone, setTone] = useState<"light" | "ink">("light");
  const [tab, setTab] = useState<(typeof TABS)[number][0] | "">("");
  const [menu, setMenu] = useState(false);
  const [narrow, setNarrow] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLParagraphElement>(null);
  const diffRef = useRef<HTMLElement>(null);
  const growRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const heroVid = useRef<HTMLVideoElement>(null);
  const diffRail = useRef<HTMLElement>(null);
  const diffItems = useRef<(HTMLElement | null)[]>([]);
  const closeMenu = () => setMenu(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 819px)");
    const apply = () => setNarrow(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const video = heroVid.current;
    if (!video) return;
    const play = video.play();
    if (play) play.catch(() => undefined);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.classList.add("is-live");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    let lastTone = "";
    let lastTab: (typeof TABS)[number][0] | "" = "";
    let lastDiff = -1;

    const update = () => {
      frame = 0;
      let nextTone: "light" | "ink" = "ink";
      root.querySelectorAll<HTMLElement>("[data-nav]").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 36 && rect.bottom >= 36) {
          nextTone = el.dataset.nav === "light" ? "light" : "ink";
        }
      });

      const storyEl = document.getElementById("story");
      const storyP = storyRef.current;
      if (storyEl && storyP) {
        const p = reduce ? 1 : sectionProgress(storyEl);
        const spans = storyP.querySelectorAll("span");
        const count = Math.round(p * spans.length);
        spans.forEach((span, index) => {
          span.classList.toggle("on", index < count);
          span.classList.toggle("caret", index === count - 1 && p < 0.992);
        });
        const rule = storyEl.querySelector<HTMLElement>(".ab-rule i");
        if (rule) rule.style.transform = `scaleX(${clamp(p * 1.35, 0, 1)})`;
      }

      if (diffRef.current) {
        const p = reduce ? 1 : sectionProgress(diffRef.current);
        const index = Math.min(DIFFS.length - 1, Math.floor(p * DIFFS.length));
        if (index !== lastDiff) {
          lastDiff = index;
          diffItems.current.forEach((el, i) => el?.classList.toggle("on", i === index));
        }
        if (diffRail.current) diffRail.current.style.transform = `scaleY(${p})`;
      }

      root.querySelectorAll<HTMLElement>(".ab-goal, .ab-impact-row").forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.88) el.classList.add("in");
      });

      if (growRef.current && whiteRef.current && copyRef.current) {
        const p = reduce ? 1 : sectionProgress(growRef.current);
        const open = reduce ? 1 : clamp(p / 0.84, 0, 1);
        const scaleX = 1 - open;
        whiteRef.current.style.transform = `scaleX(${scaleX})`;
        whiteRef.current.style.opacity = scaleX < 0.012 ? "0" : "1";
        const shade = growRef.current.querySelector<HTMLElement>(".ab-shot-shade");
        if (shade) shade.style.opacity = String(lerp(0.42, 0, open));
        const invert = scaleX < 0.08;
        copyRef.current.classList.toggle("is-invert", invert);
        copyRef.current.style.opacity = "1";
        copyRef.current.style.transform = "translate(-50%, -50%)";
        const rect = growRef.current.getBoundingClientRect();
        if (rect.top <= 36 && rect.bottom >= 36) nextTone = scaleX > 0.5 ? "ink" : "light";
        const vid = videoRef.current;
        if (vid) {
          const near = rect.top < window.innerHeight * 1.35;
          if (near && !vid.getAttribute("src")) {
            vid.preload = "auto";
            vid.src = "/about/seeds.mp4";
            vid.load();
          }
          if (Number.isFinite(vid.duration) && vid.duration > 0) {
            const vp = reduce ? 1 : clamp(p / 0.92, 0, 1);
            const target = Math.min(vid.duration - 0.04, vp * vid.duration);
            if (Math.abs(vid.currentTime - target) > 0.03) {
              try {
                vid.currentTime = target;
              } catch {
                /* seeking can throw before metadata */
              }
            }
          }
        }
      }

      if (nextTone !== lastTone) {
        lastTone = nextTone;
        setTone(nextTone);
      }

      const mid = window.innerHeight * 0.42;
      let current: (typeof TABS)[number][0] | "" = "";
      for (const [id] of TABS) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid) current = id;
      }
      if (current !== lastTab) {
        lastTab = current;
        setTab(current);
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const email = String(new FormData(event.currentTarget).get("email") || "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Enter a real email.");
      return;
    }
    setError("");
    setSent(true);
  }

  const tabIndex = Math.max(0, TABS.findIndex(([id]) => id === tab));

  return (
    <div className="page ab" ref={rootRef}>
      <header className="nav" data-tone={tone}>
        <a className="brand" href="/">
          <span className="mark">M</span>
          MR. MARTIN
        </a>
        <button
          type="button"
          className="menu-btn"
          aria-expanded={menu}
          onClick={() => setMenu((open) => !open)}
        >
          Menu
        </button>
        <nav className="links" aria-label="Page">
          <a href="/#flavors">Flavors</a>
          <a href="/#inside">Inside</a>
          <a href="/#shop">Shop</a>
          <a href="/#range">3 Pack</a>
          <a href="/about" data-on="true">
            About
          </a>
        </nav>
        <div className="nav-right">
          <a className="store-link" href="https://mrmartin.com/collections/non-gmo-sunflower-seeds">
            Store
          </a>
          <a className="cart-btn" href="/#shop" aria-label="Shopping cart">
            <CartIcon />
          </a>
        </div>
      </header>
      {menu ? <SiteMenu onClose={closeMenu} /> : null}

      <section className="ab-hero" data-nav="light">
        <video
          ref={heroVid}
          autoPlay
          muted
          loop
          playsInline
          poster="/about/hero.jpg"
          src="/about/hero.mp4"
        />
        <div className="ab-shade" />
        <div className="ab-hero-copy">
          <p className="ab-kicker">Mr. Martin</p>
          <h1>Grown where the light stays late.</h1>
          <p className="sub">From one California valley to the crack in your hand.</p>
        </div>
      </section>

      <section className="ab-story" id="story" data-nav="ink">
        <div className="ab-sticky">
          <p className="ab-kicker">The short version</p>
          <div className="ab-rule" aria-hidden="true">
            <i />
          </div>
          <p className="sr-only">{STORY}</p>
          <p className="ab-story-text" ref={storyRef} aria-hidden="true">
            {STORY.split("").map((char, index) => (
              <span key={index}>{char}</span>
            ))}
          </p>
        </div>
      </section>

      <section className="ab-diff" id="differentiators" data-nav="ink" ref={diffRef}>
        <div className="ab-sticky">
          <div className="ab-diff-lead">
            <p className="ab-kicker">What makes us different</p>
            <h2>Four things we don't negotiate.</h2>
            <div className="ab-rail" aria-hidden="true">
              <i ref={diffRail} />
            </div>
          </div>
          <div className="ab-diff-stage">
            {DIFFS.map((item, index) => (
              <article
                key={item.n}
                className={index === 0 ? "ab-diff-item on" : "ab-diff-item"}
                ref={(node) => {
                  diffItems.current[index] = node;
                }}
              >
                <span className="num">{item.n}</span>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="mission">
        <div className="ab-mission-hero" data-nav="light">
          <p className="ab-kicker">Our mission</p>
          <h2>To roast an honest seed — and leave the row better than we found it.</h2>
        </div>
        <div className="ab-goals" data-nav="ink">
          {GOALS.map((goal) => (
            <article key={goal.n} className="ab-goal">
              <span className="num">{goal.n}</span>
              <h3>{goal.t}</h3>
              <p>{goal.d}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="field">
        <div className="ab-impact" data-nav="ink">
          <div className="ab-impact-intro">
            <p className="ab-kicker">Our impact</p>
            <h2>From the flower to the pantry.</h2>
            <p>
              Every bag is a short chain: a field we can name, a kettle we watch, and a seal that keeps the crack.
            </p>
          </div>
          <div>
            {IMPACT.map((item) => (
              <article key={item.n} className="ab-impact-row">
                <span className="num">{item.n}</span>
                <h3>{item.t}</h3>
                <p>{item.d}</p>
                <img className={item.pack ? "is-pack" : undefined} src={item.img} alt={item.alt} loading="lazy" decoding="async" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ab-grow" id="grow" ref={growRef}>
        <div className="ab-grow-sticky">
          <video
            ref={videoRef}
            className="ab-shot"
            muted
            playsInline
            preload="none"
            poster="/about/seeds-poster.jpg"
          />
          <div className="ab-shot-shade" />
          <div className="ab-white" ref={whiteRef} />
          <div className="ab-grow-copy" ref={copyRef}>
            <p className="ab-kicker">Partner with Mr. Martin</p>
            <h2>
              Let's grow
              <br />
              together
            </h2>
            <p className="lede">
              Harvest notes, new roasts, and a word when a bag is worth opening early.
            </p>
            {sent ? (
              <p className="ab-thanks">You're on the list. We'll write when the next roast is bagged.</p>
            ) : (
              <form className="ab-form" onSubmit={onSubmit} noValidate>
                <label className="sr-only" htmlFor="about-email">
                  Email address
                </label>
                <input id="about-email" name="email" type="email" placeholder="Email address" autoComplete="email" />
                <button type="submit">Subscribe</button>
              </form>
            )}
            {error ? <p className="ab-form-error">{error}</p> : null}
          </div>
        </div>
      </section>

      <SiteFooter />

      {menu ? null : (
        <nav className="ab-tabs" aria-label="About sections">
          {narrow ? (
            <>
              <button
                type="button"
                aria-label="Previous section"
                onClick={() => smoothScrollToId(TABS[(tabIndex + TABS.length - 1) % TABS.length][0])}
              >
                ‹
              </button>
              <button type="button" className="ab-tab-label" onClick={() => smoothScrollToId(TABS[tabIndex][0])}>
                {TABS[tabIndex][1]}
              </button>
              <button
                type="button"
                aria-label="Next section"
                onClick={() => smoothScrollToId(TABS[(tabIndex + 1) % TABS.length][0])}
              >
                ›
              </button>
            </>
          ) : (
            TABS.map(([id, label]) => (
              <a
                key={id}
                href={`#${id}`}
                data-on={tab === id ? "true" : "false"}
                aria-current={tab === id ? "true" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  smoothScrollToId(id);
                }}
              >
                {label}
              </a>
            ))
          )}
        </nav>
      )}
    </div>
  );
}

function smoothScrollToId(id: string) {
  const el = document.getElementById(id);
  if (el) smoothScrollTo(el);
}
