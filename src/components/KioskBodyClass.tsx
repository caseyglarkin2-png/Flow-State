"use client";

import { useEffect } from "react";
import { getKioskMode } from "@/lib/kiosk/state";

export function KioskBodyClass() {
  useEffect(() => {
    const apply = () => {
      const mode = getKioskMode();
      document.documentElement.classList.toggle("kiosk", mode === "kiosk");
    };
    apply();
    window.addEventListener("kiosk-mode-change", apply as EventListener);
    return () => window.removeEventListener("kiosk-mode-change", apply as EventListener);
  }, []);
  return null;
}
