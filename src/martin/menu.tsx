import { useEffect } from "react";

const LINKS = [
  { href: "/#flavors", label: "Flavors" },
  { href: "/#inside", label: "Inside" },
  { href: "/#shop", label: "Shop" },
  { href: "/#range", label: "3 Pack" },
  { href: "/about", label: "About" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact us" },
];

const POLICIES = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/refund", label: "Refund policy" },
  { href: "/shipping", label: "Shipping Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/faqs", label: "FAQs" },
];

export function CartIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path
        d="M3.5 5h2.1l1.15 11.1a1.5 1.5 0 0 0 1.5 1.35h8.35a1.5 1.5 0 0 0 1.48-1.25L19.6 8H6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.4" cy="20.1" r="1.25" fill="currentColor" />
      <circle cx="16.4" cy="20.1" r="1.25" fill="currentColor" />
    </svg>
  );
}

export function SiteMenu({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="menu-sheet" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="menu-top">
        <a className="brand" href="/" onClick={onClose}>
          <span className="mark">M</span>
          MR. MARTIN
        </a>
        <button type="button" className="menu-close" onClick={onClose}>
          Close
        </button>
      </div>
      <nav className="menu-links" aria-label="Menu">
        {LINKS.map((link) => (
          <a key={link.href} href={link.href} onClick={onClose}>
            {link.label}
          </a>
        ))}
      </nav>
      <nav className="menu-more" aria-label="Policies">
        {POLICIES.map((link) => (
          <a key={link.href} href={link.href} onClick={onClose}>
            {link.label}
          </a>
        ))}
      </nav>
    </div>
  );
}
