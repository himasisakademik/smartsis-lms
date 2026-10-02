"use client";

import { Download, Smartphone, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function PWAInstallPrompt() {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [installInstructions, setInstallInstructions] = useState("");
  const isAdminSurface =
    pathname?.startsWith("/admin") || pathname?.startsWith("/studio");

  useEffect(() => {
    if (isAdminSurface) {
      setDeferredPrompt(null);
      return;
    }

    const navigatorWithStandalone = window.navigator as Navigator & {
      standalone?: boolean;
    };
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      navigatorWithStandalone.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const isAppleMobile =
      /iPhone|iPad|iPod/i.test(navigatorWithStandalone.userAgent) ||
      (navigatorWithStandalone.platform === "MacIntel" &&
        navigatorWithStandalone.maxTouchPoints > 1);
    const isAndroid = /Android/i.test(navigatorWithStandalone.userAgent);

    setInstallInstructions(
      isAppleMobile
        ? "Ketuk Bagikan, lalu pilih Tambahkan ke Layar Utama. Jika opsi itu tidak tersedia, buka halaman ini lewat Safari."
        : isAndroid
          ? "Buka menu browser (⋮), lalu pilih Install app atau Tambahkan ke layar utama."
          : "Pilih ikon Install di bilah alamat atau cari Install SMARTSIS App di menu browser.",
    );

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("appinstalled", handleAppInstalled);
    setIsReady(true);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isAdminSurface]);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) {
      setShowInstallInstructions(true);
      return;
    }

    setIsInstalling(true);
    try {
      await deferredPrompt.prompt();

      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsInstalled(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setShowInstallInstructions(true);
      } else {
        throw error;
      }
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  if (isAdminSurface || isInstalled || isDismissed || !isReady) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom flex justify-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-4 bg-white/95 backdrop-blur-xl border border-slate-200 px-5 py-3 rounded-full shadow-xl shadow-blue-500/10 max-w-md w-full sm:w-auto">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-sky-500 flex items-center justify-center shrink-0">
          <Smartphone className="w-4 h-4 text-white" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-900 truncate">
            Install SMARTSIS App
          </p>
          <p className="text-xs text-slate-400 truncate">
            Lebih cepat & bisa offline
          </p>
          {showInstallInstructions && (
            <output className="mt-1 block text-xs leading-5 text-slate-600">
              {installInstructions}
            </output>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleInstall}
            disabled={isInstalling}
            aria-label={
              deferredPrompt
                ? "Pasang SMARTSIS App"
                : "Lihat cara memasang SMARTSIS App"
            }
            aria-expanded={deferredPrompt ? undefined : showInstallInstructions}
            className="flex min-h-11 items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-600 text-white font-semibold text-xs hover:bg-blue-700 transition-colors disabled:opacity-50 sm:min-h-0"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {isInstalling ? "Memasang..." : "Install"}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setDeferredPrompt(null);
              setIsDismissed(true);
            }}
            aria-label="Tutup pemberitahuan instalasi"
            className="flex h-11 w-11 items-center justify-center rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors sm:h-8 sm:w-8"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
