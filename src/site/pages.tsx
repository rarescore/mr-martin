import { useMemo, useState, type FormEvent } from "react";
import { FLAVORS } from "@/martin/data";
import { FAQS, JOURNAL } from "./copy";
import { PRIVACY, REFUND, SHIPPING, TERMS } from "./policies";
import { DocBody, PageShell } from "./shell";

function useSent() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  return { sent, setSent, error, setError };
}

export function JournalPage() {
  return (
    <PageShell kicker="The journal" title="Sunflower notes" lede="From the Mr. Martin journal. The full posts still live on the store.">
      <div className="journal">
        {JOURNAL.map((post) => (
          <article key={post.href}>
            <p>{post.date}</p>
            <h2>{post.title}</h2>
            <p>{post.body}</p>
            <a href={post.href}>Read on the store</a>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function ContactPage() {
  const { sent, setSent, error, setError } = useSent();
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !String(data.get("name") || "").trim()) {
      setError("Name and a real email, please.");
      return;
    }
    setError("");
    setSent(true);
  };
  return (
    <PageShell
      kicker="Contact us"
      title="Write the roast."
      lede="Mr. Martin, Inc. · 622 Glenoaks Blvd, San Fernando, CA 91340 · (818) 361-9999 · info@mrmartin.com"
    >
      {sent ? (
        <p className="site-thanks">Got it. We'll write back from info@mrmartin.com.</p>
      ) : (
        <form className="site-form" onSubmit={onSubmit}>
          <label>
            Name
            <input name="name" autoComplete="name" required />
          </label>
          <label>
            Email
            <input name="email" type="email" autoComplete="email" required />
          </label>
          <label>
            Message
            <textarea name="message" rows={5} required />
          </label>
          {error ? <p className="site-error">{error}</p> : null}
          <button type="submit">Send</button>
        </form>
      )}
    </PageShell>
  );
}

export function FaqPage() {
  return (
    <PageShell kicker="FAQs" title="Before you write us.">
      <div className="faqs">
        {FAQS.map((item) => (
          <details key={item.q}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </PageShell>
  );
}

export function TrackPage() {
  const { sent, setSent, error, setError } = useSent();
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !String(data.get("order") || "").trim()) {
      setError("Order number and the email on the order.");
      return;
    }
    setError("");
    setSent(true);
  };
  return (
    <PageShell
      kicker="Track order"
      title="Where is the bag?"
      lede="Orders leave in 1–5 working days. The dispatch email carries the tracking number. Check spam if it is quiet."
    >
      {sent ? (
        <p className="site-thanks">
          If the dispatch email is missing, write info@mrmartin.com with the order number and we will look it up.
        </p>
      ) : (
        <form className="site-form" onSubmit={onSubmit}>
          <label>
            Order number
            <input name="order" required />
          </label>
          <label>
            Email on the order
            <input name="email" type="email" autoComplete="email" required />
          </label>
          {error ? <p className="site-error">{error}</p> : null}
          <button type="submit">Look it up</button>
        </form>
      )}
    </PageShell>
  );
}

export function SearchPage() {
  const [q, setQ] = useState("");
  const query = q.trim().toLowerCase();
  const flavors = useMemo(
    () => FLAVORS.filter((flavor) => `${flavor.name} ${flavor.line}`.toLowerCase().includes(query)),
    [query],
  );
  const posts = useMemo(
    () => JOURNAL.filter((post) => `${post.title} ${post.body}`.toLowerCase().includes(query)),
    [query],
  );
  const faqs = useMemo(
    () => FAQS.filter((item) => `${item.q} ${item.a}`.toLowerCase().includes(query)),
    [query],
  );
  return (
    <PageShell kicker="Search" title="Find a bag, a note, a question.">
      <form className="site-form" onSubmit={(event) => event.preventDefault()}>
        <label>
          Search
          <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Salted, shipping, roast" />
        </label>
      </form>
      <div className="search-hits">
        <h2>Flavors</h2>
        {flavors.length === 0 ? <p>No flavor match.</p> : flavors.map((flavor) => (
          <a key={flavor.id} href={`/#shop`}>{flavor.name} — {flavor.line}</a>
        ))}
        <h2>Journal</h2>
        {posts.length === 0 ? <p>No journal match.</p> : posts.map((post) => (
          <a key={post.href} href="/journal">{post.title}</a>
        ))}
        <h2>FAQs</h2>
        {faqs.length === 0 ? <p>No question match.</p> : faqs.map((item) => (
          <a key={item.q} href="/faqs">{item.q}</a>
        ))}
      </div>
    </PageShell>
  );
}

export function DoNotSellPage() {
  return (
    <PageShell kicker="Our policies" title="Do not sell my personal information">
      <DocBody
        paragraphs={[
          "Mr. Martin does not sell your personal information.",
          "We share order and device details with the services that run the store, including Shopify, and with Google Analytics, as described in the Privacy Policy. That is so we can take the order, ship the bag, and see which pages people actually use.",
          "To opt out of targeted advertising, use the Facebook, Google, and Bing links on the Privacy Policy page, or the Digital Advertising Alliance opt-out.",
          "To ask us not to share your information for advertising, write info@mrmartin.com with the subject “Do not sell or share my personal information.” Include the email on your order so we can find it.",
        ]}
      />
    </PageShell>
  );
}

export function PrivacyPage() {
  return (
    <PageShell kicker="Our policies" title="Privacy Policy">
      <DocBody paragraphs={PRIVACY} />
    </PageShell>
  );
}

export function RefundPage() {
  return (
    <PageShell kicker="Our policies" title="Refund policy">
      <DocBody paragraphs={REFUND} />
    </PageShell>
  );
}

export function ShippingPage() {
  return (
    <PageShell kicker="Our policies" title="Shipping policy">
      <DocBody paragraphs={SHIPPING} />
    </PageShell>
  );
}

export function TermsPage() {
  return (
    <PageShell kicker="Our policies" title="Terms of Service">
      <DocBody paragraphs={TERMS} />
    </PageShell>
  );
}
