"use client";

import Link from "next/link";
import { ShieldX, ArrowLeft, LogOut } from "lucide-react";

export default function UnauthorizedPage({ email }: { email?: string }) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto">
          <ShieldX className="w-10 h-10 text-red-400" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Akses Ditolak
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Anda tidak memiliki izin untuk mengakses halaman admin. Hanya email
            yang terdaftar oleh Super Admin yang dapat mengakses dashboard ini.
          </p>
          {email && (
            <p className="text-xs text-slate-600 font-mono bg-white border border-slate-200 rounded-lg px-4 py-2 inline-block">
              {email}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-blue-700 hover:bg-blue-600 text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Dashboard
          </Link>
          <Link
            href="/sign-in?redirect_url=/admin"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-200 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Ganti Akun
          </Link>
        </div>
      </div>
    </div>
  );
}
