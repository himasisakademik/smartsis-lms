"use client";

import { useEffect, useState } from "react";
import { projectId } from "@/sanity/env";

const sanityToken = process.env.NEXT_PUBLIC_SANITY_ADMIN_TOKEN || "";

export default function StudioClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && projectId && sanityToken) {
      try {
        const tokenData = JSON.stringify({ token: sanityToken });
        localStorage.setItem(`__studio_auth_token_${projectId}`, tokenData);
        localStorage.setItem(`__sanity_auth_token_${projectId}`, tokenData);
        localStorage.setItem("__sanity_auth_token", tokenData);
      } catch (err) {
        console.error("Failed to set sanity token in localStorage:", err);
      }
    }
    setIsReady(true);
  }, []);

  if (!isReady) {
    return null;
  }

  return <>{children}</>;
}
