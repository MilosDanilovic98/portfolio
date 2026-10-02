// Every design the site can switch to. `dark` swaps the white/black icon sets,
// `pixelated` keeps hard pixels when a raster scene is scaled up.
export const SKINS = [
  {
    id: "original",
    name: "Original",
    blurb: "The current neobrutalist site with its PixiJS sky, day and night",
  },
  {
    id: "diorama",
    name: "Cut-out diorama",
    blurb: "WebGL scene of Pljevlja, with day and night",
  },
  {
    id: "poster",
    name: "Travel poster",
    blurb: "Vintage Yugoslav tourism poster",
  },
  {
    id: "lowpoly",
    name: "Low-poly 3D",
    blurb: "Faceted dusk with glass panels",
    dark: true,
  },
  { id: "paper", name: "Paper cut-out", blurb: "Layered card stock and tape" },
  { id: "watercolor", name: "Ink & watercolour", blurb: "A travel sketchbook" },
  {
    id: "synthwave",
    name: "Synthwave",
    blurb: "Neon grid and terminal windows",
    dark: true,
  },
  {
    id: "neobrutal",
    name: "Neobrutalism",
    blurb: "Thick outlines, hard shadows",
  },
  {
    id: "pixel",
    name: "Pixel art",
    blurb: "16-bit game with dialogue boxes",
    dark: true,
    pixelated: true,
  },
  {
    id: "riso",
    name: "Risograph",
    blurb: "Pink, blue and yellow halftone print",
  },
  {
    id: "blueprint",
    name: "Blueprint",
    blurb: "Technical drawing with dimensions",
    dark: true,
  },
  {
    id: "folk",
    name: "Folk embroidery",
    blurb: "Montenegrin cross-stitch on linen",
  },
  { id: "bauhaus", name: "Bauhaus", blurb: "Primary colours and pure shapes" },
  { id: "ukiyoe", name: "Ukiyo-e", blurb: "Japanese woodblock print" },
  { id: "deco", name: "Art Deco", blurb: "Navy and gold, 1920s", dark: true },
  {
    id: "desktop",
    name: "1-bit desktop",
    blurb: "Dithered retro computer",
    pixelated: true,
  },
  {
    id: "glass",
    name: "Stained glass",
    blurb: "A church window in a stone arch",
    dark: true,
  },
  {
    id: "aurora",
    name: "Aurora night",
    blurb: "Northern lights and glass cards",
    dark: true,
  },
  { id: "clay", name: "Claymorphism", blurb: "Soft pastel clay" },
  {
    id: "comic",
    name: "Comic book",
    blurb: "Halftone dots and speech bubbles",
  },
  { id: "topo", name: "Topographic map", blurb: "A hiking map of the region" },
  {
    id: "terminal",
    name: "ASCII terminal",
    blurb: "Green phosphor text art",
    dark: true,
  },
  {
    id: "midcentury",
    name: "Mid-century",
    blurb: "1950s teal, mustard and orange",
  },
  { id: "crayon", name: "Crayon storybook", blurb: "Wax crayon on paper" },
  {
    id: "manuscript",
    name: "Illuminated manuscript",
    blurb: "Gold leaf and Gothic letters",
  },
  {
    id: "sunset",
    name: "Firewatch sunset",
    blurb: "Layered silhouettes at dusk",
    dark: true,
  },
  {
    id: "linocut",
    name: "Linocut print",
    blurb: "Carved black ink and one red",
  },
  { id: "mosaic", name: "Roman mosaic", blurb: "Stone tesserae and grout" },
  {
    id: "chalk",
    name: "Chalkboard",
    blurb: "Chalk drawing on a blackboard",
    dark: true,
  },
  {
    id: "engraving",
    name: "Newspaper engraving",
    blurb: "Line engraving and newsprint",
  },
  { id: "aero", name: "Frutiger Aero", blurb: "Glossy 2000s bubbles and sky" },
  {
    id: "monoline",
    name: "Minimal monoline",
    blurb: "One line, one accent colour",
  },
];
export const SKIN_IDS = SKINS.map((s) => s.id);
export const DEFAULT_SKIN = "original";
