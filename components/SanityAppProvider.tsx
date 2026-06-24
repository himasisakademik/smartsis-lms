"use client";

import { SanityApp } from "@sanity/sdk-react";
import { dataset, projectId } from "@/sanity/env";

const sanityToken = process.env.NEXT_PUBLIC_SANITY_ADMIN_TOKEN || "";

function SanityAppProvider({ children }: { children: React.ReactNode }) {
  if (!sanityToken) {
    return (
      <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
        <div className="mx-auto max-w-xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-red-700">
            Konfigurasi Sanity admin belum lengkap
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Environment variable NEXT_PUBLIC_SANITY_ADMIN_TOKEN belum tersedia,
            sehingga admin custom tidak bisa memuat data Sanity.
          </p>
        </div>
      </div>
    );
  }

  return (
    <SanityApp
      config={[
        {
          projectId,
          dataset,
          studioMode: {
            enabled: true,
          },
          auth: {
            token: sanityToken || undefined,
          },
        },
      ]}
      fallback={<div />}
    >
      {children}
    </SanityApp>
  );
}

export default SanityAppProvider;
