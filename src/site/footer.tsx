import { useState, type FormEvent } from "react";
import { SOCIAL } from "./copy";

const FAQ = [
  ["FAQs", "/faqs"],
  ["Contact us", "/contact"],
  ["Track Order", "/track"],
];

const POLICIES = [
  ["Privacy Policy", "/privacy"],
  ["Refund Policy", "/refund"],
  ["Shipping Policy", "/shipping"],
  ["Terms of Service", "/terms"],
];

function SocialIcon({ name }: { name: string }) {
  if (name === "Instagram") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
      </svg>
    );
  }
  if (name === "Facebook") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14 9h3V6h-3c-2.2 0-4 1.8-4 4v2H8v3h2v7h3v-7h2.6l.4-3H13v-2c0-.6.4-1 1-1z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (name === "Twitter") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M17.6 4h2.4l-5.3 6.1L21 20h-4.6l-3.6-4.7L8.6 20H6.2l5.7-6.5L3.4 4h4.7l3.3 4.3L17.6 4zm-.8 14.4h1.3L7.3 5.5H5.9l10.9 12.9z"
          fill="currentColor"
        />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M14.2 4.2c.5 1.8 1.8 3.1 3.6 3.6v2.4c-1.2 0-2.3-.4-3.2-1v6.6c0 3-2.4 5.2-5.4 5.2S3.8 18.8 3.8 15.8s2.4-5.2 5.4-5.2c.3 0 .6 0 .9.1v2.6c-.3-.1-.6-.2-.9-.2-1.6 0-2.8 1.2-2.8 2.7s1.2 2.7 2.8 2.7 2.8-1.2 2.8-2.7V4.2h2.2z"
        fill="currentColor"
      />
    </svg>
  );
}

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSent(true);
  };
  return (
    <footer className="site-foot" id="foot" data-nav="light">
      <div className="site-foot-grid">
        <div>
          <p className="site-foot-label">FAQ</p>
          <ul>
            {FAQ.map(([label, href]) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="site-foot-label">Our policies</p>
          <ul>
            {POLICIES.map(([label, href]) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="site-foot-news">
          <p className="site-foot-label">Sign up and save</p>
          <p>We'll let you know about new products and special offers!</p>
          {sent ? (
            <p className="site-foot-thanks">You're on the list.</p>
          ) : (
            <form onSubmit={onSubmit}>
              <label className="sr-only" htmlFor="foot-email">
                Enter your email
              </label>
              <input
                id="foot-email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              <button type="submit" aria-label="Subscribe">
                →
              </button>
            </form>
          )}
          <div className="site-social">
            {SOCIAL.map((item) => (
              <a key={item.name} href={item.href} target="_blank" rel="noreferrer" aria-label={item.name}>
                <SocialIcon name={item.name} />
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="site-foot-base">
        <a className="brand" href="/">
          <span className="mark">M</span>
          MR. MARTIN
        </a>
        <p>Mr. Martin, Inc. · 622 Glenoaks Blvd, San Fernando, CA 91340 · (818) 361-9999</p>
      </div>
    </footer>
  );
}
