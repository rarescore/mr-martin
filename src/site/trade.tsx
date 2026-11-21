import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";

const SEED_SRC = [0, 1, 2, 3, 4].map((i) => `/bags/bits/s${i}.webp`);

function SplitLine({ text }: { text: string }) {
  return (
    <span className="split-line">
      {Array.from(text).map((ch, i) =>
        ch === " " ? (
          <span key={i} className="sp">
            {" "}
          </span>
        ) : (
          <span key={`${ch}-${i}`} className="lt" data-ch={ch}>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

function SeedField() {
  const bits = Array.from({ length: 18 }, (_, i) => {
    const dur = 6.5 + (i % 7) * 1.15;
    return {
      i,
      left: `${3 + ((i * 41) % 94)}%`,
      size: 26 + (i % 5) * 9,
      dur,
      delay: -((i * 0.83) % dur),
      drift: `${(i % 2 === 0 ? 1 : -1) * (16 + (i % 5) * 14)}px`,
      spin: `${120 + (i % 6) * 48}deg`,
      src: SEED_SRC[i % SEED_SRC.length],
    };
  });
  return (
    <div className="seed-field" aria-hidden="true">
      {bits.map((bit) => (
        <i
          key={bit.i}
          style={
            {
              left: bit.left,
              width: bit.size,
              height: bit.size * 0.68,
              backgroundImage: `url(${bit.src})`,
              animationDuration: `${bit.dur}s`,
              animationDelay: `${bit.delay}s`,
              "--drift": bit.drift,
              "--spin": bit.spin,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

export function TradeSection() {
  const root = useRef<HTMLElement>(null);
  const white = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setReady(true);
          io.disconnect();
        }
      },
      { rootMargin: "900px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!ready) return;
    const vid = video.current;
    if (!vid) return;
    const play = () => {
      vid.play().catch(() => {});
    };
    vid.addEventListener("loadeddata", play);
    play();
    return () => vid.removeEventListener("loadeddata", play);
  }, [ready]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;
    const update = () => {
      frame = 0;
      const total = el.offsetHeight - window.innerHeight;
      const p = reduce || total <= 0 ? 1 : Math.min(1, Math.max(0, -el.getBoundingClientRect().top / total));
      const open = reduce ? 1 : Math.min(1, p / 0.82);
      const cover = Math.max(0, 1 - open);
      if (white.current) {
        white.current.style.transform = `scaleX(${cover})`;
        white.current.style.opacity = cover < 0.012 ? "0" : "1";
      }
      const shade = el.querySelector<HTMLElement>(".trade-shade");
      if (shade) shade.style.opacity = String(0.22 * cover);
      const panel = white.current?.getBoundingClientRect();
      copy.current?.querySelectorAll<HTMLElement>(".lt").forEach((letter) => {
        const box = letter.getBoundingClientRect();
        const mid = box.left + box.width * 0.5;
        const inside =
          cover >= 0.012 && panel ? mid >= panel.left && mid <= panel.right : false;
        letter.classList.toggle("is-light", !inside);
      });
      const invert = cover < 0.22;
      el.dataset.invert = invert ? "true" : "false";
      copy.current?.classList.toggle("is-invert", invert);
      const vid = video.current;
      if (vid) vid.style.transform = `scale(${1.08 - open * 0.06})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
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

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    const business = String(data.get("business") || "").trim();
    if (!business || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Business name and a real email.");
      return;
    }
    setError("");
    setSent(true);
  };

  return (
    <section className="trade" id="trade" ref={root}>
      <div className="trade-sticky">
        <video
          ref={video}
          className="trade-shot"
          muted
          loop
          playsInline
          preload="none"
          poster="/about/seeds-poster.jpg"
          src={ready ? "/about/seeds.mp4" : undefined}
        />
        <SeedField />
        <div className="trade-shade" />
        <div className="trade-white" ref={white} />
        <div className="trade-copy" ref={copy}>
          <p className="trade-for">
            <SplitLine text="FOR" />
          </p>
          <p className="trade-for trade-dist">
            <SplitLine text="DISTRIBUTORS" />
          </p>
          <h2>
            <SplitLine text="LET'S STOCK" />
            <br />
            <SplitLine text="TOGETHER" />
          </h2>
          <p className="trade-lede">Tell us the counter, the city, and which bags you want on the shelf.</p>
          {sent ? (
            <p className="trade-thanks">Received. We'll write about the bags, the packs, and the route.</p>
          ) : (
            <form onSubmit={onSubmit}>
              <input name="business" placeholder="Business name" aria-label="Business name" required />
              <input name="name" placeholder="Your name" aria-label="Your name" autoComplete="name" />
              <input name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="email" required />
              <input name="city" placeholder="City" aria-label="City" />
              <select name="role" aria-label="I am a" defaultValue="store">
                <option value="store">A store</option>
                <option value="distributor">A distributor</option>
              </select>
              <textarea name="note" rows={2} placeholder="What do you want to carry?" aria-label="What do you want to carry?" />
              {error ? <p className="trade-error">{error}</p> : null}
              <button type="submit">Send</button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
