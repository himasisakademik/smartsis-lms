"use client";

import { SanityApp } from "@sanity/sdk-react";
import { dataset, projectId } from "@/sanity/env";

const sanityToken = process.env.NEXT_PUBLIC_SANITY_ADMIN_TOKEN || "";
const SanityAppWithAuthError = SanityApp as React.ComponentType<
  React.ComponentProps<typeof SanityApp> & {
    LoginErrorComponent?: React.ComponentType<SanityAuthErrorProps>;
  }
>;

type SanityAuthErrorProps = {
  resetErrorBoundary: () => void;
};

function SanityAdminAuthError({ resetErrorBoundary }: SanityAuthErrorProps) {
  return (
    <div className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
      <div className="mx-auto max-w-2xl rounded-xl border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-600">
          Sanity authentication error
        </p>
        <h1 className="mt-2 text-xl font-semibold">
          Admin LMS belum bisa terhubung ke Sanity
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Token admin terbaca, tetapi browser production belum berhasil
          melakukan autentikasi ke Sanity. Biasanya ini terjadi karena domain
          production belum ditambahkan ke CORS Origins Sanity, token sudah
          dicabut, atau deployment belum di-rebuild setelah environment variable
          diubah.
        </p>
        <button
          type="button"
          onClick={resetErrorBoundary}
          className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}

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
    <SanityAppWithAuthError
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
      LoginErrorComponent={SanityAdminAuthError}
    >
      {children}
    </SanityAppWithAuthError>
  );
}

export default SanityAppProvider;
