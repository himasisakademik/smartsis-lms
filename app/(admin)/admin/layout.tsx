import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import AdminBreadcrumb from "@/components/admin/layout/AdminBreadcrumb";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Providers } from "@/components/Providers";
import AdminAuthGuard from "@/components/admin/AdminAuthGuard";
import AdminHeader from "@/components/admin/layout/AdminHeader";

function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/admin"
      signUpFallbackRedirectUrl="/admin"
      afterSignOutUrl="/"
    >
      <Providers>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <div
            className="fixed inset-0 pointer-events-none opacity-[0.015]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            }}
          />

          <Suspense
            fallback={
              <LoadingSpinner
                text="Loading Admin Dashboard..."
                isFullScreen
                size="lg"
              />
            }
          >
            <AdminAuthGuard>
              <AdminHeader />
              <div className="relative z-10 px-6 py-4">
                <AdminBreadcrumb />
              </div>
              <main className="relative z-10 px-6 pb-8 container mx-auto">
                {children}
              </main>
            </AdminAuthGuard>
          </Suspense>
        </div>
      </Providers>
    </ClerkProvider>
  );
}

export default AdminLayout;
