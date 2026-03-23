export type LC = "EN" | "AR" | "ES" | "FR";

export const LANGUAGES: { code: LC; locale: string }[] = [
  { code: "EN", locale: "en" },
  { code: "AR", locale: "ar" },
  { code: "ES", locale: "es" },
  { code: "FR", locale: "fr" },
];

export const LANG_TO_LOCALE: Record<LC, string> = {
  EN: "en",
  AR: "ar",
  ES: "es",
  FR: "fr",
};

export const LANG_STORAGE_KEY = "astgse-lang";
export const LANG_CHANGE_EVENT = "astgse:lang-change";

export function isRtl(lang: LC): boolean {
  return lang === "AR";
}
