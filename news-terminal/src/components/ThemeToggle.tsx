"use client";

import { useEffect, useState } from "react";

// Gece/gündüz anahtarı: kullanıcının seçimi localStorage'da kalır; seçim
// yapılmadıysa sistem tercihi geçerlidir. Kontrol hissi sakinliğin parçası.
export function ThemeToggle() {
  const [theme, setTheme] = useState<string | null>(null);

  useEffect(() => {
    // 0-timeout: SSR/hydration uyumsuzluğu olmadan, render-tetiklemeli effect
    // gövdesinde senkron setState kuralına takılmadan temayı oku.
    const timer = setTimeout(() => {
      setTheme(document.documentElement.dataset.theme ?? "dark");
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("nt_theme", next);
    } catch {
      // storage kapalıysa geçiş yine de bu sekmede çalışır
    }
    setTheme(next);
  };

  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={theme === "dark" ? "Gündüz temasına geç" : "Gece temasına geç"}
      title={theme === "dark" ? "Gündüz teması" : "Gece teması"}
    >
      {theme === null ? "◐" : theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
