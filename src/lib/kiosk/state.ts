export type KioskMode = "standard" | "kiosk";

const KEY = "freightroll_kiosk_mode";

export function getKioskMode(): KioskMode {
  if (typeof window === "undefined") return "standard";
  const v = window.localStorage.getItem(KEY);
  return v === "kiosk" ? "kiosk" : "standard";
}

export function setKioskMode(mode: KioskMode) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, mode);
  window.dispatchEvent(new CustomEvent("kiosk-mode-change", { detail: mode }));
}
