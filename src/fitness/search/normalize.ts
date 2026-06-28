const ARABIC_DIACRITICS = /[ً-ٰٟ]/g;
const TATWEEL = /ـ/g;

const ALEF_VARIANTS = /[آأإٱ]/g;
const YEH_VARIANTS = /[ى]/g;
const TEH_MARBUTA = /[ة]/g;

export function normalizeArabic(text: string): string {
  return text
    .replace(ARABIC_DIACRITICS, "")
    .replace(TATWEEL, "")
    .replace(ALEF_VARIANTS, "ا")
    .replace(YEH_VARIANTS, "ي")
    .replace(TEH_MARBUTA, "ه")
    .trim();
}

export function normalizeText(text: string): string {
  const lower = text.toLowerCase().trim();
  // Collapse multiple spaces
  const collapsed = lower.replace(/\s+/g, " ");
  // Remove punctuation except hyphens
  const noPunct = collapsed.replace(/[^\w\s؀-ۿ-]/g, "");
  return normalizeArabic(noPunct);
}

export function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/[\s-]+/)
    .filter((t) => t.length > 1);
}
