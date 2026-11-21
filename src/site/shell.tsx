import { useState, type ReactNode } from "react";
import { CartIcon, SiteMenu } from "@/martin/menu";
import { SiteFooter } from "./footer";
import "../martin/page.css";
import "./site.css";

export function PageShell({
  kicker,
  title,
  lede,
  children,
}: {
  kicker?: string;
  title: string;
  lede?: string;
  children: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  return (
    <div className="site">
      <header className="site-nav">
        <a className="brand" href="/">
          <span className="mark">M</span>
          MR. MARTIN
        </a>
        <button type="button" className="menu-btn" aria-expanded={menu} onClick={() => setMenu(true)}>
          Menu
        </button>
        <nav className="site-links" aria-label="Pages">
          <a href="/journal">Journal</a>
          <a href="/contact">Contact us</a>
          <a href="/#shop">Shop</a>
          <a href="/about">About</a>
        </nav>
        <div className="nav-right">
          <a className="cart-btn" href="/#shop" aria-label="Shopping cart">
            <CartIcon />
          </a>
        </div>
      </header>
      {menu ? <SiteMenu onClose={() => setMenu(false)} /> : null}
      <main className="site-main">
        {kicker ? <p className="site-kicker">{kicker}</p> : null}
        <h1>{title}</h1>
        {lede ? <p className="site-lede">{lede}</p> : null}
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}

export function DocBody({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="doc">
      {paragraphs.map((paragraph, index) => {
        const heading = paragraph.length < 92 && !/[.!?]$/.test(paragraph);
        return heading ? <h2 key={index}>{paragraph}</h2> : <p key={index}>{paragraph}</p>;
      })}
    </div>
  );
}
