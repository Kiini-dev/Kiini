import i18n from "../../../src/i18n/config";

export const LANGUAGE_OPTIONS = [
  { code: "en", label: "English" },
] as const;

const LANGUAGE_STORAGE_KEY = "app_language";

export function languageCode(value: string | null | undefined): string {
  if (!value) return "en";
  const option = LANGUAGE_OPTIONS.find(
    (item) => item.code === value.toLowerCase() || item.label.toLowerCase() === value.toLowerCase()
  );
  return option?.code || "en";
}

export async function changeAppLanguage(value: string): Promise<string> {
  const code = "en";
  await i18n.changeLanguage(code);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, code);
  localStorage.setItem("crm_language", code);
  localStorage.setItem("app_language", code);
  document.documentElement.lang = code;
  window.dispatchEvent(new CustomEvent("app-language-changed", { detail: code }));
  return code;
}

export function getStoredLanguage(): string {
  return "en";
}

export function initializeAppLanguage(): void {
  void changeAppLanguage(getStoredLanguage());
}
