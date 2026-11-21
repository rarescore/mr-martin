export type Pack = { count: number; price: number };

export type Flavor = {
  id: string;
  name: string;
  num: string;
  color: string;
  tone: "light" | "ink";
  front: string;
  back: string;
  line: string;
  packs: Pack[];
};

export const FLAVORS: Flavor[] = [
  {
    id: "salted",
    name: "Salted",
    num: "01",
    color: "#1280c8",
    tone: "light",
    front: "/bags/salted-front.webp",
    back: "/bags/salted-back.webp",
    line: "Roasted with sea salt.",
    packs: [
      { count: 3, price: 17.99 },
      { count: 6, price: 23.99 },
      { count: 12, price: 37.99 },
    ],
  },
  {
    id: "unsalted",
    name: "Unsalted",
    num: "02",
    color: "#1d5c38",
    tone: "light",
    front: "/bags/unsalted-front.webp",
    back: "/bags/unsalted-back.webp",
    line: "Just the seed. Nothing added.",
    packs: [
      { count: 3, price: 17.99 },
      { count: 6, price: 23.99 },
      { count: 12, price: 37.99 },
    ],
  },
  {
    id: "alpine",
    name: "Alpine Salted",
    num: "03",
    color: "#FFF7E7",
    tone: "ink",
    front: "/bags/alpine-front.webp?v=4",
    back: "/bags/alpine-back.webp?v=4",
    line: "A lighter salt. Same crunch.",
    packs: [
      { count: 3, price: 21.99 },
      { count: 6, price: 32.99 },
      { count: 12, price: 49.99 },
    ],
  },
];

export const STEPS = [
  {
    num: "01",
    head: "REAL SEEDS,\nFIRST",
    cap: "Grade 1 striped seeds.\nNothing you can't pronounce.",
  },
  {
    num: "02",
    head: "ROASTED,\nNOT RUSHED",
    cap: "Small batch in California.\nSea salt, or none at all.",
  },
  {
    num: "03",
    head: "SEALED\nTO STAY FRESH",
    cap: "Resealable bag.\nCrack them when you want.",
  },
  {
    num: "04",
    head: "",
    cap: "Non-GMO. Keto. Kosher.\nThe bag you already picked.",
  },
] as const;

export const STEP_TURNS = [0, 180, 360, 720];

export const AUTOPLAY_MS = 5000;
export const PACK_WAS = 17.99;
export const PACK_PRICE = 16.5;
export const ASPECT = 867 / 1400;

export const SEEDS = [0, 1, 2, 3, 4].map((i) => `/bags/bits/s${i}.webp`);

export type Reel = {
  id: string;
  src: string;
  poster: string;
  handle: string;
  href: string;
  label: string;
};

export const REELS: Reel[] = [
  {
    id: "market",
    src: "/reels/market.mp4",
    poster: "/reels/market.jpg",
    handle: "@hrant_healthy_lifestyle",
    href: "https://www.instagram.com/p/DY-n7AySlF1/",
    label: "Market booth",
  },
  {
    id: "chili",
    src: "/reels/chili-lime.mp4",
    poster: "/reels/chili-lime.jpg",
    handle: "@mr__martin_",
    href: "https://www.instagram.com/p/DaOuEp5yUvI/",
    label: "Chili Lime in Shanghai",
  },
  {
    id: "match",
    src: "/reels/match-day.mp4",
    poster: "/reels/match-day.jpg",
    handle: "@mr__martin_",
    href: "https://www.instagram.com/p/DaOtumauFAP/",
    label: "Match day",
  },
  {
    id: "booth",
    src: "/reels/booth.mp4",
    poster: "/reels/booth.jpg",
    handle: "@hrant_healthy_lifestyle",
    href: "https://www.instagram.com/p/DWutSR7JFaC/",
    label: "Booth with the bags",
  },
  {
    id: "hollywood",
    src: "/reels/hollywood.mp4",
    poster: "/reels/hollywood.jpg",
    handle: "@mr__martin_",
    href: "https://www.instagram.com/mr__martin_/",
    label: "Hollywood Boulevard",
  },
];

export function money(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function mod(n: number, m = FLAVORS.length) {
  return ((n % m) + m) % m;
}
