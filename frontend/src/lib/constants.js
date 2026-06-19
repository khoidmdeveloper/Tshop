const CATEGORIES = [
  { id: "cpu", name: "Processors", icon: "\u2699\uFE0F" },
  { id: "gpu", name: "Graphics Cards", icon: "\u{1F3AE}" },
  { id: "motherboard", name: "Motherboards", icon: "\u{1F4DF}" },
  { id: "ram", name: "RAM", icon: "\u{1F9E0}" },
  { id: "storage", name: "Storage", icon: "\u{1F4BE}" },
  { id: "psu", name: "Power Supplies", icon: "\u26A1" },
  { id: "case", name: "Cases", icon: "\u{1F4E6}" },
  { id: "cooler", name: "Cooling", icon: "\u2744\uFE0F" }
];
const PRICE_RANGES = [
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 - $500", min: 100, max: 500 },
  { label: "$500 - $1000", min: 500, max: 1e3 },
  { label: "$1000 - $2000", min: 1e3, max: 2e3 },
  { label: "Over $2000", min: 2e3, max: Number.POSITIVE_INFINITY }
];
const RATINGS = [
  { label: "5 Stars", value: 5 },
  { label: "4 Stars & Up", value: 4 },
  { label: "3 Stars & Up", value: 3 },
  { label: "2 Stars & Up", value: 2 }
];
export {
  CATEGORIES,
  PRICE_RANGES,
  RATINGS
};
