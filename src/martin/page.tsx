import { useEffect, useRef, useState } from "react";
import {
  ASPECT,
  AUTOPLAY_MS,
  FLAVORS,
  PACK_PRICE,
  PACK_WAS,
  REELS,
  SEEDS,
  STEP_TURNS,
  STEPS,
  money,
  mod,
  type Reel,
} from "./data";
import { SiteMenu, CartIcon } from "./menu";
import { REVIEWS } from "@/site/copy";
import { SiteFooter } from "@/site/footer";
import { TradeSection } from "@/site/trade";
import "@/site/site.css";
import "./page.css";

type Line = {
  key: string;
  name: string;
  detail: string;
  price: number;
  qty: number;
  img: string;
};

type Anim = { from: number; to: number; start: number; dur: number };

const PIECES = Array.from({ length: 16 }, (_, i) => ({
  src: SEEDS[i % SEEDS.length],
  ang: (i / 16) * Math.PI * 2 + (i % 3) * 0.17,
  spin: (i % 2 === 0 ? 1 : -1) * (180 + (i % 5) * 30),
  size: 54 + (i % 5) * 14,
  phase: i / 16,
}));

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function glide(t: number) {
  const x1 = 0.25;
  const y1 = 0.75;
  const x2 = 0.2;
  const y2 = 1;
  let u = t;
  for (let i = 0; i < 5; i++) {
    const x = 3 * (1 - u) * (1 - u) * u * x1 + 3 * (1 - u) * u * u * x2 + u * u * u;
    const dx = 3 * (1 - u) * (1 - u) * x1 + 6 * (1 - u) * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(dx) < 1e-4) break;
    u = clamp(u - (x - t) / dx, 0, 1);
  }
  return 3 * (1 - u) * (1 - u) * u * y1 + 3 * (1 - u) * u * u * y2 + u * u * u;
}

function easeIO(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2;
}

function sine(t: number) {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function wrapK(delta: number, n = FLAVORS.length) {
  let k = ((delta % n) + n) % n;
  if (k > n / 2) k -= n;
  return k;
}

const reelStops = new Set<() => void>();

function ReelCard({ reel }: { reel: Reel }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const articleRef = useRef<HTMLElement>(null);
  const pointer = useRef<"mouse" | "touch" | "pen" | "key">("key");
  const reduceRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [armed, setArmed] = useState(false);
  const stopSelf = useRef<() => void>(() => {});
  const pauseRef = useRef<(reset: boolean) => void>(() => {});
  const playGen = useRef(0);

  pauseRef.current = (reset: boolean) => {
    playGen.current += 1;
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    if (reset) {
      try {
        video.currentTime = 0;
      } catch {
        /* not seekable yet */
      }
    }
    setPlaying(false);
    reelStops.delete(stopSelf.current);
  };

  useEffect(() => {
    reduceRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const stop = () => pauseRef.current(true);
    stopSelf.current = stop;
    const el = articleRef.current;
    if (!el) return () => reelStops.delete(stop);
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setArmed(true);
          io.disconnect();
        }
      },
      { rootMargin: "280px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      reelStops.delete(stop);
    };
  }, []);

  const playFrom = (reset: boolean) => {
    const video = videoRef.current;
    if (!video) return;
    const gen = ++playGen.current;
    if (!video.getAttribute("src")) {
      video.preload = "auto";
      video.src = reel.src;
      setArmed(true);
    }
    reelStops.forEach((fn) => {
      if (fn !== stopSelf.current) fn();
    });
    reelStops.add(stopSelf.current);
    video.muted = true;
    const start = () => {
      if (playGen.current !== gen) return;
      if (reset) {
        try {
          video.currentTime = 0;
        } catch {
          /* not seekable yet */
        }
      }
      if (!video.paused) {
        setPlaying(true);
        return;
      }
      void video.play().then(() => {
        if (playGen.current === gen && !video.paused) setPlaying(true);
      }).catch(() => {
        if (playGen.current === gen) setPlaying(false);
      });
    };
    if (video.readyState >= 2) start();
    else {
      video.addEventListener("canplay", start, { once: true });
      void video.play().catch(() => {});
    }
  };

  return (
    <article
      className="reel"
      data-playing={playing}
      ref={articleRef}
      onMouseEnter={() => {
        if (!reduceRef.current) playFrom(true);
      }}
      onMouseLeave={() => {
        if (!reduceRef.current) pauseRef.current(true);
      }}
    >
      <video
        ref={videoRef}
        src={armed ? reel.src : undefined}
        poster={reel.poster}
        muted
        playsInline
        loop
        preload="none"
      />
      <button
        type="button"
        className="reel-hit"
        aria-label={playing ? `Pause ${reel.label}` : `Play ${reel.label}`}
        onPointerDown={(event) => {
          if (event.pointerType === "mouse" || event.pointerType === "touch" || event.pointerType === "pen") {
            pointer.current = event.pointerType;
          }
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") pointer.current = "key";
        }}
        onClick={() => {
          const video = videoRef.current;
          if (!video) return;
          const mouse = pointer.current === "mouse" && !reduceRef.current;
          if (mouse) {
            if (video.paused) playFrom(true);
            return;
          }
          if (video.paused) playFrom(false);
          else pauseRef.current(false);
        }}
      >
        <span className="reel-play" aria-hidden="true" />
      </button>
      <div className="reel-meta">
        <span>{reel.handle}</span>
        <a href={reel.href} target="_blank" rel="noreferrer" aria-label={`${reel.handle} on Instagram`}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
          </svg>
        </a>
      </div>
    </article>
  );
}

export function MartinPage() {
  const [shown, setShown] = useState(0);
  const [step, setStep] = useState(0);
  const [auto, setAuto] = useState(true);
  const [nav, setNav] = useState("flavors");
  const [tone, setTone] = useState<"light" | "ink">("light");
  const [pick, setPick] = useState(() => FLAVORS.map((f) => f.packs.length - 1));
  const [lines, setLines] = useState<Line[]>([]);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]);
  const [added, setAdded] = useState(false);
  const touched = useRef(false);
  const seeded = useRef(false);

  const pageRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const insideRef = useRef<HTMLElement>(null);
  const shopRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const rangeRef = useRef<HTMLElement>(null);
  const reelsRef = useRef<HTMLElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const arcRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const inFrontRef = useRef<HTMLDivElement>(null);
  const inBarRef = useRef<HTMLDivElement>(null);
  const darkRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null);
  const cartRef = useRef<HTMLButtonElement>(null);
  const bagRefs = useRef<(HTMLDivElement | null)[]>([]);
  const innerRefs = useRef<(HTMLDivElement | null)[]>([]);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const pkRefs = useRef<(HTMLElement | null)[]>([]);
  const bitRefs = useRef<(HTMLElement | null)[]>([]);
  const shownRef = useRef(0);
  const stepRef = useRef(0);
  const autoRef = useRef(true);
  const goToRef = useRef<(n: number) => void>(() => {});
  const api = useRef({ setShown, setStep, setNav, setTone });
  api.current = { setShown, setStep, setNav, setTone };

  const count = lines.reduce((s, l) => s + l.qty, 0);
  const flavor = FLAVORS[shown];
  const head = step === 3 ? flavor.name.replace(" ", "\n") : STEPS[step].head;

  useEffect(() => {
    autoRef.current = auto;
  }, [auto]);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) setAuto(false);

    let pos = reduce ? 0 : -1.35;
    let target = 0;
    let anim: Anim | null = reduce
      ? null
      : { from: -1.35, to: 0, start: performance.now(), dur: 1500 };
    let settledAt = performance.now();
    let dragging = false;
    let moved = false;
    let vel = 0;
    let lastX = 0;
    let lastT = 0;
    let pos0 = 0;
    let startX = 0;
    let slotPx = 320;
    let raf = 0;
    let flip = { from: 0, to: 0, start: 0, dur: 1, cur: 0 };
    let lastStep = 0;
    let reveal: { color: string; start: number; dur: number } | null = null;
    let poke: { index: number; start: number } | null = null;
    let shopAligned = -1;
    let shopGate = -1;
    let cardsHold = false;
    let heldInside: { x: number; y: number; h: number } | null = null;

    const page = pageRef.current;
    const hero = heroRef.current;
    const inside = insideRef.current;
    const shop = shopRef.current;
    const range = rangeRef.current;
    const reels = reelsRef.current;
    const revealEl = revealRef.current;
    const arc = arcRef.current;
    const controls = controlsRef.current;
    const front = inFrontRef.current;
    if (!page || !hero || !inside || !shop || !range || !revealEl || !arc || !controls || !front) {
      return;
    }

    page.style.setProperty("--flav", FLAVORS[0].color);

    function publish(index: number) {
      const i = mod(Math.round(index));
      if (i === shownRef.current) return;
      const prevColor = FLAVORS[shownRef.current].color;
      shownRef.current = i;
      api.current.setShown(i);
      if (reduce) {
        page!.style.setProperty("--flav", FLAVORS[i].color);
        return;
      }
      reveal = { color: FLAVORS[i].color, start: performance.now(), dur: 420 };
      revealEl!.style.background = FLAVORS[i].color;
      page!.style.setProperty("--flav", prevColor);
    }

    function goTo(n: number) {
      target = n;
      const from = pos;
      const dist = Math.abs(n - from);
      if (reduce || dist < 0.001) {
        pos = n;
        anim = null;
        settledAt = performance.now();
      } else {
        anim = {
          from,
          to: n,
          start: performance.now(),
          dur: 650 + Math.max(0, dist - 1) * 160,
        };
      }
      publish(n);
    }
    goToRef.current = (n: number) => {
      settledAt = performance.now() + AUTOPLAY_MS;
      goTo(n);
    };

    function onDown(e: PointerEvent) {
      if (e.button !== 0) return;
      dragging = true;
      moved = false;
      startX = e.clientX;
      lastX = e.clientX;
      lastT = performance.now();
      pos0 = pos;
      vel = 0;
      settledAt = performance.now() + AUTOPLAY_MS;
    }
    function onMove(e: PointerEvent) {
      if (!dragging) return;
      const dx = e.clientX - startX;
      if (!moved && Math.abs(dx) < 6) return;
      if (!moved) {
        moved = true;
        anim = null;
        document.body.classList.add("dragging");
        arc!.setPointerCapture(e.pointerId);
      }
      const now = performance.now();
      const inst = (e.clientX - lastX) / Math.max(16, now - lastT);
      vel = vel * 0.6 + inst * 0.4;
      lastX = e.clientX;
      lastT = now;
      pos = pos0 - dx / slotPx;
    }
    function finish(e: PointerEvent) {
      if (!dragging) return;
      dragging = false;
      document.body.classList.remove("dragging");
      if (arc!.hasPointerCapture(e.pointerId)) arc!.releasePointerCapture(e.pointerId);
      if (!moved) {
        const rel = e.clientX - window.innerWidth / 2;
        if (Math.abs(rel) > slotPx * 0.28) goTo(target + (rel > 0 ? 1 : -1));
        else poke = { index: mod(target), start: performance.now() };
        settledAt = performance.now() + AUTOPLAY_MS;
        return;
      }
      const vSlots = -vel / slotPx;
      const to = Math.round(pos + clamp(vSlots * 220, -2, 2));
      goTo(to);
      settledAt = performance.now() + AUTOPLAY_MS;
    }
    arc.addEventListener("pointerdown", onDown);
    arc.addEventListener("pointermove", onMove);
    arc.addEventListener("pointerup", finish);
    arc.addEventListener("pointercancel", finish);

    function onKey(e: KeyboardEvent) {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const r = hero!.getBoundingClientRect();
      const vis = Math.min(r.bottom, window.innerHeight) - Math.max(r.top, 0);
      if (vis < window.innerHeight * 0.5) return;
      e.preventDefault();
      settledAt = performance.now() + AUTOPLAY_MS;
      goTo(target + (e.key === "ArrowRight" ? 1 : -1));
    }
    window.addEventListener("keydown", onKey);
    const onCardsDown = (e: PointerEvent) => {
      if (cardsRef.current?.contains(e.target as Node)) cardsHold = true;
    };
    const onCardsUp = () => {
      cardsHold = false;
    };
    window.addEventListener("pointerdown", onCardsDown);
    window.addEventListener("pointerup", onCardsUp);
    window.addEventListener("pointercancel", onCardsUp);

    const loop = (now: number) => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const narrow = vw < 820;

      if (anim) {
        const t = clamp((now - anim.start) / anim.dur, 0, 1);
        pos = lerp(anim.from, anim.to, reduce ? 1 : glide(t));
        if (t >= 1) {
          pos = anim.to;
          anim = null;
          settledAt = now;
        }
      }

      const hr = hero.getBoundingClientRect();
      const heroVis =
        (Math.min(hr.bottom, vh) - Math.max(hr.top, 0)) / Math.max(1, hr.height) >= 0.6;
      if (
        autoRef.current &&
        !reduce &&
        !dragging &&
        !anim &&
        heroVis &&
        document.visibilityState === "visible" &&
        now - settledAt > AUTOPLAY_MS
      ) {
        goTo(target + 1);
        settledAt = now + AUTOPLAY_MS;
      }

      if (reveal) {
        const t = clamp((now - reveal.start) / reveal.dur, 0, 1);
        const cx = vw / 2;
        const cy = vh * 0.4;
        const R =
          1.45 *
          Math.hypot(Math.max(cx, vw - cx), Math.max(cy, vh - cy));
        const r = R * glide(t);
        const f = Math.max(60, r * 0.35);
        revealEl.style.clipPath = `circle(${r}px at ${cx}px ${cy}px)`;
        if (t >= 1) {
          page.style.setProperty("--flav", reveal.color);
          revealEl.style.clipPath = "circle(0px at 50% 42%)";
          reveal = null;
        }
      }

      const titleSpace = narrow ? 176 : 156;
      const topRoom = narrow ? 108 : 92;
      const maxH = vh - titleSpace - topRoom;
      const h0 = Math.min(
        vh * (narrow ? 0.44 : 0.66),
        narrow ? 400 : 680,
        Math.max(narrow ? 250 : 240, maxH),
      );
      const hSide = h0 * (narrow ? 0.52 : 0.58);
      const gap = Math.max(narrow ? 14 : 36, vw * (narrow ? 0.016 : 0.04));
      slotPx = (h0 * ASPECT) / 2 + (hSide * ASPECT) / 2 + gap;
      const cy = narrow ? (topRoom + (vh - titleSpace)) / 2 : topRoom + h0 / 2;
      const cx = vw / 2;

      const ir = inside.getBoundingClientRect();
      const insideH = inside.offsetHeight;
      const pScroll = clamp(-ir.top / Math.max(1, insideH - vh), 0, 1);
      const p1 = clamp(1 - ir.top / vh, 0, 1);
      const sr = shop.getBoundingClientRect();
      const seedT = clamp((pScroll - 0.56) / 0.38, 0, 1);
      const q = reduce ? 0 : easeIO(seedT);
      const stepIndex = clamp(Math.floor(Math.min(pScroll, 0.78) / 0.195), 0, 3);

      if (stepIndex !== lastStep) {
        flip.from = flip.cur;
        flip.to = STEP_TURNS[stepIndex];
        flip.start = now;
        const turns = Math.abs(flip.to - flip.from) / 180;
        flip.dur = reduce ? 1 : 720 * clamp(turns, 0.4, 2);
        lastStep = stepIndex;
        stepRef.current = stepIndex;
        api.current.setStep(stepIndex);
      }
      {
        const t = clamp((now - flip.start) / flip.dur, 0, 1);
        flip.cur = lerp(flip.from, flip.to, reduce ? 1 : sine(t));
      }

      const active = mod(target);
      const scroller = cardsRef.current;
      const activeCard = cardRefs.current[active];
      const shopNear = sr.top < vh * 1.15 && sr.bottom > vh * 0.15;
      if (
        narrow &&
        scroller &&
        activeCard &&
        activeCard.offsetWidth > 2 &&
        !cardsHold &&
        (shopAligned !== active || (shopNear && shopGate !== active))
      ) {
        const scRect = scroller.getBoundingClientRect();
        const cardRect = activeCard.getBoundingClientRect();
        const delta = cardRect.left - scRect.left;
        const nextLeft = scroller.scrollLeft + delta - (scRect.width - cardRect.width) / 2;
        scroller.scrollLeft = Math.max(0, nextLeft);
        shopAligned = active;
        if (shopNear) shopGate = active;
      }
      if (!shopNear) shopGate = -1;

      const pkActive = pkRefs.current[active]?.getBoundingClientRect();
      let p3 = 0;
      if (pkActive && pkActive.width > 2) {
        const mid = pkActive.top + pkActive.height / 2;
        const start = vh * 1.2;
        const end = vh * (narrow ? 0.5 : 0.56);
        p3 = clamp((start - mid) / Math.max(1, start - end), 0, 1);
      } else {
        p3 = clamp((vh - sr.top) / (vh * 0.9), 0, 1);
      }

      const inBar = inBarRef.current?.getBoundingClientRect();
      const fadeOthers = 1 - clamp(p1 * 1.6, 0, 1);

      controls.style.transform = `translateY(${hr.top}px)`;
      controls.style.visibility = hr.bottom > 40 && hr.top < vh ? "visible" : "hidden";
      arc.style.transform = `translateY(${hr.top}px)`;
      arc.style.visibility = controls.style.visibility;

      let pinY = 0;
      if (ir.top > 0) pinY = ir.top;
      else if (ir.bottom < vh) pinY = ir.bottom - vh;
      const seeing = ir.bottom > 0 && ir.top < vh;
      front.style.transform = `translateY(${pinY}px)`;
      front.style.visibility = seeing ? "visible" : "hidden";
      if (darkRef.current) darkRef.current.style.opacity = String(clamp((seedT - 0.34) / 0.5, 0, 1) * 0.42);
      if (copyRef.current) copyRef.current.style.opacity = String(1 - clamp((seedT - 0.4) / 0.4, 0, 1));

      const reviews = page.querySelector<HTMLElement>("#reviews");
      const trade = page.querySelector<HTMLElement>("#trade");
      const foot = page.querySelector<HTMLElement>("#foot");
      const sections: [string, DOMRect | undefined][] = [
        ["flavors", hr],
        ["inside", ir],
        ["shop", sr],
        ["range", range.getBoundingClientRect()],
        ["reels", reels?.getBoundingClientRect()],
        ["reviews", reviews?.getBoundingClientRect()],
        ["trade", trade?.getBoundingClientRect()],
        ["foot", foot?.getBoundingClientRect()],
      ];
      let section = "flavors";
      for (const [id, rect] of sections) {
        if (rect && rect.top < vh * 0.35) section = id;
      }
      const tradeOpen = trade?.dataset.invert === "true";
      const flavDark = (section === "flavors" || section === "inside") && FLAVORS[active].tone === "ink";
      page.dataset.flavTone = FLAVORS[active].tone;
      const ink = flavDark || section === "shop" || section === "reviews" || (section === "trade" && !tradeOpen);
      const tone = ink ? "ink" : "light";
      if (section !== (page.dataset.nav ?? "flavors") || page.dataset.tone !== tone) {
        page.dataset.nav = section;
        page.dataset.tone = tone;
        api.current.setNav(section);
        api.current.setTone(tone);
      }

      for (let j = 0; j < FLAVORS.length; j++) {
        const el = bagRefs.current[j];
        const inner = innerRefs.current[j];
        if (!el || !inner) continue;
        const k = wrapK(j - pos);
        const ak = Math.abs(k);
        const sign = Math.sign(k) || 1;
        const bob = reduce ? 0 : Math.sin((now / 4600) * Math.PI * 2 + j * 1.37);
        let ax = cx + k * slotPx;
        let ay = cy + ak * (narrow ? 10 : 18) - (bob * 0.5 + 0.5) * (reduce ? 0 : 8);
        let ah = lerp(h0, hSide, Math.min(ak, 1));
        let arz = sign * Math.min(ak, 1) * 2 + bob * 0.35;
        let ary = sign * Math.min(ak, 1) * 6;
        let arx = 0;
        let aop = ak > 1.15 ? clamp(1 - (ak - 1.15) / 0.45, 0, 1) : 1;

        const card = cardRefs.current[j];
        const pk = pkRefs.current[j];
        const pr = pk?.getBoundingClientRect();
        let bx = ax;
        let by = ay;
        let bh = ah;
        let brz = 8;
        let bry = flip.cur + (reduce ? 0 : q * 320);
        const inBob = reduce ? 0 : Math.sin((now / 2600) * Math.PI * 2) * 6;
        if (inBar && inBar.height > 2) {
          const pinned = ir.top <= 1 && ir.bottom >= vh - 1;
          const spot = {
            x: inBar.left + inBar.width / 2,
            y: inBar.top + inBar.height / 2,
            h: inBar.height,
          };
          if (pinned) heldInside = spot;
          if (pinned || !heldInside) {
            bx = spot.x;
            by = spot.y + inBob;
            bh = spot.h;
          } else {
            bx = heldInside.x;
            by = heldInside.y;
            bh = heldInside.h;
          }
        }
        let cxp = bx;
        let cyp = by;
        let ch = bh;
        let crz = 0;
        let cry = bry;
        let crx = 0;
        if (pr && pr.width > 2) {
          cxp = pr.left + pr.width / 2;
          cyp = pr.top + pr.height / 2;
          ch = pr.height;
          const tx = Number(card?.dataset.tx ?? 0);
          const ty = Number(card?.dataset.ty ?? 0);
          cry = Math.round(bry / 360) * 360 + tx * 12;
          crx = -ty * 12;
        }

        const e1 = easeIO(p1);
        const e3 = easeIO(p3);
        let x = ax;
        let y = ay;
        let h = ah;
        let rz = arz;
        let ry = ary;
        let rx = arx;
        let op = aop;
        if (j === active) {
          x = lerp(lerp(ax, bx, e1), cxp, e3);
          y = lerp(lerp(ay, by, e1), cyp, e3);
          h = lerp(lerp(ah, bh, e1), ch, e3);
          rz = lerp(lerp(arz, brz, e1), crz, e3);
          ry = lerp(lerp(ary, bry, e1), cry, e3);
          rx = lerp(lerp(arx, 0, e1), crx, e3);
          op = 1;
          if (poke && poke.index === j) {
            const pt = clamp((now - poke.start) / 500, 0, 1);
            const sx = pt < 0.3 ? lerp(1, 1.06, pt / 0.3) : pt < 0.6 ? lerp(1.06, 0.97, (pt - 0.3) / 0.3) : lerp(0.97, 1, (pt - 0.6) / 0.4);
            const sy = pt < 0.3 ? lerp(1, 0.93, pt / 0.3) : pt < 0.6 ? lerp(0.93, 1.04, (pt - 0.3) / 0.3) : lerp(1.04, 1, (pt - 0.6) / 0.4);
            h *= sy;
            el.style.width = `${h * ASPECT * sx}px`;
            if (pt >= 1) poke = null;
          }
          card?.classList.toggle("live", p3 > 0.45);
        } else {
          op = aop * fadeOthers;
          card?.classList.remove("live");
        }

        const w = j === active && poke ? Number.parseFloat(el.style.width) || h * ASPECT : h * ASPECT;
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.opacity = String(op);
        el.style.transform = `translate3d(${x - w / 2}px, ${y - h / 2}px, 0)`;
        el.style.zIndex = String(j === active ? 12 : 8 + Math.round((1.5 - ak) * 2));
        inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
      }

      const origin = { x: cx, y: cy };
      const activeEl = bagRefs.current[active];
      if (activeEl) {
        const mx = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(activeEl.style.transform);
        if (mx) {
          origin.x = Number(mx[1]) + activeEl.offsetWidth / 2;
          origin.y = Number(mx[2]) + activeEl.offsetHeight / 2;
        }
      }
      bitRefs.current.forEach((bit, i) => {
        if (!bit) return;
        if (reduce || seedT <= 0.004) {
          bit.style.opacity = "0";
          return;
        }
        const piece = PIECES[i];
        const delay = piece.phase * 0.16;
        const life = clamp((seedT - delay) / (0.9 - delay), 0, 1);
        if (life <= 0) {
          bit.style.opacity = "0";
          return;
        }
        const travel = 1 - (1 - life) ** 2;
        const R = narrow ? Math.min(vw, vh) * 0.4 : Math.hypot(vw, vh) * 0.34;
        const radius = (0.07 + travel * 0.9) * R;
        const x = origin.x + Math.cos(piece.ang) * radius * (narrow ? 0.9 : 1);
        const y = origin.y + Math.sin(piece.ang) * radius * 0.7;
        const env = Math.sin(Math.PI * clamp(seedT, 0, 1)) ** 0.85;
        const sc = (narrow ? 0.52 : 0.82) * (0.42 + 0.8 * travel) * (piece.size / 88);
        bit.style.opacity = String(env * clamp(life * 4.5, 0, 1));
        bit.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${sc}) rotate(${piece.spin * travel * 0.5}deg)`;
      });

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      arc.removeEventListener("pointerdown", onDown);
      arc.removeEventListener("pointermove", onMove);
      arc.removeEventListener("pointerup", finish);
      arc.removeEventListener("pointercancel", finish);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onCardsDown);
      window.removeEventListener("pointerup", onCardsUp);
      window.removeEventListener("pointercancel", onCardsUp);
      document.body.classList.remove("dragging");
    };
  }, []);

  useEffect(() => {
    const el = rangeRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || seeded.current || touched.current) return;
        seeded.current = true;
        const a = shownRef.current;
        window.setTimeout(() => setSlots([a, null, null]), 200);
        window.setTimeout(() => setSlots([a, mod(a + 1), null]), 400);
        window.setTimeout(() => setSlots([a, mod(a + 1), mod(a + 2)]), 600);
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function addLine(line: Omit<Line, "qty">) {
    setLines((prev) => {
      const hit = prev.find((l) => l.key === line.key);
      if (!hit) return [...prev, { ...line, qty: 1 }];
      return prev.map((l) => (l.key === line.key ? { ...l, qty: l.qty + 1 } : l));
    });
  }

  function fly(from: HTMLElement, src: string) {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cart = cartRef.current;
    if (reduce || !cart) return;
    const r = from.getBoundingClientRect();
    const c = cart.getBoundingClientRect();
    const node = document.createElement("img");
    node.src = src;
    node.alt = "";
    const dx = c.left + c.width / 2 - (r.left + r.width / 2);
    const dy = c.top + c.height / 2 - (r.top + r.height / 2);
    node.style.cssText = `position:fixed;z-index:70;left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;object-fit:contain;pointer-events:none;`;
    document.body.appendChild(node);
    const anim = node.animate(
      [
        { transform: "translate(0,0) scale(1) rotate(0deg)", opacity: 1 },
        {
          transform: `translate(${dx * 0.4}px, ${dy * 0.4 - Math.min(140, Math.abs(dy) * 0.3 + 40)}px) scale(0.5) rotate(-10deg)`,
          opacity: 1,
          offset: 0.45,
        },
        { transform: `translate(${dx}px, ${dy}px) scale(0.16) rotate(-18deg)`, opacity: 0.15 },
      ],
      { duration: 900, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" },
    );
    anim.onfinish = () => node.remove();
  }

  function addBag(index: number) {
    const f = FLAVORS[index];
    const pack = f.packs[pick[index]] ?? f.packs[0];
    const from = pkRefs.current[index];
    if (from) fly(from, f.front);
    addLine({
      key: `${f.id}-${pack.count}`,
      name: f.name,
      detail: `${pack.count} bags`,
      price: pack.price,
      img: f.front,
    });
  }

  function addThumb(index: number) {
    touched.current = true;
    setSlots((prev) => {
      const next = [...prev];
      const hole = next.findIndex((s) => s === null);
      if (hole === -1) return prev;
      next[hole] = index;
      return next;
    });
  }

  function clearSlot(i: number) {
    touched.current = true;
    setSlots((prev) => prev.map((s, idx) => (idx === i ? null : s)));
  }

  function buyPack() {
    if (slots.some((s) => s === null)) return;
    slots.forEach((s, i) => {
      if (s === null) return;
      const img = document.querySelector<HTMLElement>(`[data-slot="${i}"] img`);
      if (img) fly(img, FLAVORS[s].front);
    });
    const names = slots.map((s) => (s === null ? "" : FLAVORS[s].name)).join(", ");
    window.setTimeout(() => {
      addLine({
        key: `pack-${names}`,
        name: "3 pack",
        detail: names,
        price: PACK_PRICE,
        img: FLAVORS[slots[0] ?? 0].front,
      });
      setSlots([null, null, null]);
      touched.current = true;
      setAdded(true);
      window.setTimeout(() => setAdded(false), 1600);
    }, 60);
  }

  function scrollToStep(i: number) {
    const section = insideRef.current;
    if (!section) return;
    const start = section.offsetTop;
    const span = section.offsetHeight - window.innerHeight;
    const p = (i + 0.45) * 0.195;
    window.scrollTo({ top: start + p * span, behavior: "smooth" });
  }

  const full = slots.every((s) => s !== null);
  const missing = slots.filter((s) => s === null).length;

  return (
    <div className="page" ref={pageRef}>
      <header className="nav" data-tone={tone}>
        <a className="brand" href="#flavors">
          <span className="mark">M</span>
          MR. MARTIN
        </a>
        <button type="button" className="menu-btn" aria-expanded={menu} onClick={() => setMenu((v) => !v)}>
          Menu
        </button>
        <nav className="links" aria-label="Page">
          {[
            ["flavors", "Flavors"],
            ["inside", "Inside"],
            ["shop", "Shop"],
            ["range", "3 Pack"],
          ].map(([id, label]) => (
            <a key={id} href={`#${id}`} data-on={nav === id}>
              {label}
            </a>
          ))}
          <a href="/about">About</a>
        </nav>
        <div className="nav-right">
          <a className="store-link" href="https://mrmartin.com/collections/non-gmo-sunflower-seeds">
            Store
          </a>
          <button className="cart-btn" ref={cartRef} onClick={() => setOpen(true)} aria-label="Shopping cart">
            <CartIcon />
            {count > 0 ? <span className="badge">{count}</span> : null}
          </button>
        </div>
      </header>
      {menu ? <SiteMenu onClose={() => setMenu(false)} /> : null}

      <section className="hero" id="flavors" ref={heroRef}>
        <div className="reveal" ref={revealRef} />
        <div className="rings" />
        <p className="count" aria-hidden="true">
          {flavor.num}
        </p>
        <div className="hero-copy">
          <p className="kicker">Freshly roasted in California</p>
          <h1 key={flavor.id}>
            {flavor.name.split(" ").map((word) => (
              <span key={word}>
                {word}
                <br />
              </span>
            ))}
          </h1>
          <p className="hero-line">{flavor.line}</p>
        </div>
      </section>

      <div className="arc" ref={arcRef} />
      <div className="hero-controls" ref={controlsRef}>
        <button className="next" aria-label="Next flavour" onClick={() => goToRef.current(shown + 1)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M5 12h12" />
            <path d="M13 6l6 6-6 6" />
          </svg>
        </button>
        <button
          className="auto"
          aria-pressed={auto}
          onClick={() => setAuto((v) => !v)}
        >
          <i>{auto ? (<><b /><b /></>) : (<><b /></>)}</i>
          AUTOPLAY
        </button>
      </div>

      {FLAVORS.map((f, i) => (
        <div className="bag" key={f.id} ref={(n) => { bagRefs.current[i] = n; }}>
          <div className="bag-inner" ref={(n) => { innerRefs.current[i] = n; }}>
            <img
              className="face front"
              src={f.front}
              alt={`${f.name} sunflower seeds`}
              decoding="async"
              loading={i === 0 ? "eager" : "lazy"}
              fetchPriority={i === 0 ? "high" : "low"}
            />
            <img className="face back" src={f.back} alt="" loading="lazy" decoding="async" fetchPriority="low" />
          </div>
        </div>
      ))}

      <section className="inside" id="inside" ref={insideRef}>
        <div className="pin">
          <div className="in-dark" ref={darkRef} />
          <div className="in-bar" ref={inBarRef} />
        </div>
      </section>
      <div className="in-front" ref={inFrontRef}>
        <div className="frame">
          <div ref={copyRef}>
            <p className="in-num">{STEPS[step].num}</p>
            <h2 className="in-head" key={`${step}-${flavor.id}`}>
              {head.split("\n").map((line, i) => (
                <span key={`${line}-${i}`}>
                  {line}
                  <br />
                </span>
              ))}
            </h2>
            <p className="in-cap">{STEPS[step].cap}</p>
            <div className="step-pills">
              {STEPS.map((s, i) => (
                <button key={s.num} data-on={step === i} onClick={() => scrollToStep(i)} aria-label={`Step ${s.num}`}>
                  {s.num}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="storm" aria-hidden="true">
        {PIECES.map((p, i) => (
          <i
            key={i}
            ref={(n) => { bitRefs.current[i] = n; }}
            style={{ backgroundImage: `url(${p.src})`, width: p.size, height: p.size * 0.72 }}
          />
        ))}
      </div>

      <section className="shop" id="shop" ref={shopRef}>
        <div className="shop-head">
          <h2>
            GRAB
            <br />
            A BAG
          </h2>
          <p>Three roasts, roasted in California. Choose a 3, a 6, or a 12 where we pack it that way.</p>
        </div>
        <div className="cards" ref={cardsRef}>
          {FLAVORS.map((f, i) => {
            const pack = f.packs[pick[i]] ?? f.packs[0];
            return (
              <article
                key={f.id}
                className="card"
                data-tone={f.tone}
                ref={(n) => { cardRefs.current[i] = n; }}
                style={{ background: f.color }}
                onMouseMove={(e) => {
                  if (!window.matchMedia("(pointer: fine)").matches) return;
                  const r = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - r.left) / r.width - 0.5;
                  const y = (e.clientY - r.top) / r.height - 0.5;
                  e.currentTarget.dataset.tx = x.toFixed(3);
                  e.currentTarget.dataset.ty = y.toFixed(3);
                  e.currentTarget.style.transform = `translateY(-8px) rotateX(${(-y * 10).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.dataset.tx = "0";
                  e.currentTarget.dataset.ty = "0";
                  e.currentTarget.style.transform = "";
                }}
              >
                <h3>{f.name}</h3>
                <p className="sub">{f.line}</p>
                <div className="pk" ref={(n) => { pkRefs.current[i] = n; }}>
                  <img src={f.front} alt="" loading="lazy" decoding="async" />
                </div>
                <div className="sizes" role="group" aria-label={`${f.name} pack size`}>
                  {f.packs.map((p, pi) => (
                    <button key={p.count} data-on={pick[i] === pi} onClick={() => setPick((prev) => prev.map((v, idx) => (idx === i ? pi : v)))}>
                      {p.count}
                    </button>
                  ))}
                </div>
                <div className="buy-row">
                  <div className="price">
                    {money(pack.price)}
                    <small>{pack.count} bags</small>
                  </div>
                  <button className="add" aria-label={`Add ${pack.count} bags of ${f.name}`} onClick={() => addBag(i)}>
                    +
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="range" id="range" ref={rangeRef}>
        <div className="glow" />
        <h2>
          BUILD YOUR
          <br />
          <em>3</em> PACK &
          <br />
          SAVE $1.49
        </h2>
        <p className="save">Mix the three roasts</p>
        <div className="slots">
          {slots.map((s, i) => (
            <div className="slot" key={i} data-slot={i}>
              {s === null ? (
                <span className="x" aria-hidden="true">
                  +
                </span>
              ) : (
                <>
                  <button className="x" aria-label={`Remove ${FLAVORS[s].name}`} onClick={() => clearSlot(i)}>
                    ×
                  </button>
                  <img src={FLAVORS[s].front} alt={FLAVORS[s].name} loading="lazy" decoding="async" />
                </>
              )}
            </div>
          ))}
        </div>
        <div className="thumbs">
          {FLAVORS.map((f, i) => (
            <button key={f.id} className="thumb" onClick={() => addThumb(i)}>
              <span style={{ background: f.color }}>
                <img src={f.front} alt="" loading="lazy" decoding="async" />
              </span>
              <b>{f.name}</b>
            </button>
          ))}
        </div>
        <button className="pack-buy" disabled={!full && !added} data-added={added} onClick={buyPack}>
          {added ? (
            "Added to cart"
          ) : full ? (
            <>
              Add 3 pack · {money(PACK_PRICE)} <s>{money(PACK_WAS)}</s>
            </>
          ) : (
            `Pick ${missing} more`
          )}
        </button>
        <p className="fine">A full pack is $1.49 off the usual 3-bag price. Checkout continues on the Mr. Martin store.</p>
      </section>

      <section className="reels" id="reels" ref={reelsRef}>
        <div className="reels-head">
          <h2>
            SEEN
            <br />
            AROUND
          </h2>
          <p>Clips from the feed. They stay quiet until you play one.</p>
        </div>
        <div className="reel-grid">
          {REELS.map((reel) => (
            <ReelCard key={reel.id} reel={reel} />
          ))}
        </div>
      </section>

      <section className="reviews" id="reviews">
        <div className="reviews-head">
          <h2>
            WHAT
            <br />
            PEOPLE SAY
          </h2>
          <p>From buyers on Amazon and Walmart. The crunch, the size, the salt.</p>
        </div>
        <div className="review-grid">
          {REVIEWS.map((review) => (
            <figure className="review" key={review.name}>
              <div className="stars" aria-label={`${review.stars} stars`}>
                {"★★★★★".slice(0, review.stars)}
              </div>
              <p>{review.quote}</p>
              <figcaption>
                {review.name}
                <span>
                  {review.flavor} · {review.where}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <TradeSection />
      <SiteFooter />

      {open ? (
        <>
          <button className="drawer-back" aria-label="Close cart" onClick={() => setOpen(false)} />
          <aside className="drawer" role="dialog" aria-label="Cart">
            <header>
              <h2>Cart</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">
                ×
              </button>
            </header>
            {lines.length === 0 ? <p className="empty">Nothing in the bag yet.</p> : null}
            {lines.map((l) => (
              <div className="line" key={l.key}>
                <img src={l.img} alt="" />
                <p>
                  {l.name} × {l.qty}
                  <br />
                  <small>{l.detail}</small>
                </p>
                <strong>{money(l.price * l.qty)}</strong>
              </div>
            ))}
            <div className="checkout">
              <a href="https://mrmartin.com/collections/non-gmo-sunflower-seeds">Continue on Mr. Martin</a>
              <p>This cart is the new front end. The store still takes the order.</p>
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
