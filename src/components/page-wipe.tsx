import { useRouter } from "@tanstack/react-router";
import { useEffect, useRef } from "react";
import "./page-wipe.css";

export function PageWipe() {
  const router = useRouter();
  const busy = useRef(false);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;
      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      const next = url.pathname.replace(/\/$/, "") || "/";
      if (next !== "/" && next !== "/about") return;

      event.preventDefault();
      event.stopPropagation();
      if (busy.current) return;
      busy.current = true;

      const root = document.documentElement;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const wipe = document.querySelector(".page-wipe");
      const go = () => {
        const hash = url.hash.replace(/^#/, "");
        const done = () => {
          requestAnimationFrame(() => {
            wipe?.classList.add("leave");
            root.classList.remove("wiping");
            window.setTimeout(() => {
              wipe?.classList.remove("on", "leave");
              busy.current = false;
            }, reduce ? 0 : 700);
          });
        };
        if (next === "/about") {
          void router.navigate({ to: "/about" }).then(done, done);
        } else {
          void router.navigate({ to: "/", hash: hash || undefined }).then(done, done);
        }
      };

      wipe?.classList.add("on");
      root.classList.add("wiping");
      if (reduce) go();
      else window.setTimeout(go, 640);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [router]);

  return (
    <div className="page-wipe" aria-hidden="true">
      <i className="sq" />
      <span className="mark">M</span>
    </div>
  );
}
