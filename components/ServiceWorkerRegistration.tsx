"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  const pathname = usePathname();

  useEffect(() => {
    const isAdminSurface =
      pathname?.startsWith("/admin") || pathname?.startsWith("/studio");

    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production"
    ) {
      if (isAdminSurface) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          registrations.forEach((registration) => {
            registration.unregister();
          });
        });

        if ("caches" in window) {
          caches.keys().then((keys) => {
            keys
              .filter((key) => key.startsWith("smartsis-"))
              .forEach((key) => {
                caches.delete(key);
              });
          });
        }
        return;
      }

      let updateInterval: ReturnType<typeof setInterval> | undefined;

      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("[SW] Registered:", registration.scope);

          updateInterval = setInterval(
            () => {
              registration.update();
            },
            60 * 60 * 1000,
          );
        })
        .catch((error) => {
          console.error("[SW] Registration failed:", error);
        });

      return () => {
        if (updateInterval) {
          clearInterval(updateInterval);
        }
      };
    }
  }, [pathname]);

  return null;
}
