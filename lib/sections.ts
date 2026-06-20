export const SECTIONS = [
  { id: "hero", label: "Intro", n: "01" },
  { id: "work", label: "Work", n: "02" },
  { id: "about", label: "About", n: "03" },
  { id: "process", label: "Process", n: "04" },
  { id: "metrics", label: "Numbers", n: "05" },
  { id: "contact", label: "Contact", n: "06" },
  { id: "site-footer", label: "Colophon", n: "07" },
] as const;

export type Section = (typeof SECTIONS)[number];
