"use client";

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { SUPER_ADMIN_EMAIL } from "@/lib/admin";
import UnauthorizedPage from "@/components/admin/UnauthorizedPage";
import LoadingSpinner from "@/components/LoadingSpinner";

export default function AdminAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoaded } = useUser();
  const [authState, setAuthState] = useState<{
    loading: boolean;
    authorized: boolean;
    email?: string;
  }>({ loading: true, authorized: false });

  useEffect(() => {
    if (!isLoaded) return;

    if (!user) {
      setAuthState({ loading: false, authorized: false });
      return;
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      setAuthState({ loading: false, authorized: false, email: undefined });
      return;
    }

    const superAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

    if (superAdmin) {
      setAuthState({ loading: false, authorized: true, email });
      return;
    }

    fetch("/api/admin-check")
      .then((res) => res.json())
      .then((data) => {
        setAuthState({
          loading: false,
          authorized: data.authorized === true,
          email,
        });
      })
      .catch(() => {
        setAuthState({ loading: false, authorized: false, email });
      });
  }, [user, isLoaded]);

  if (authState.loading || !isLoaded) {
    return (
      <LoadingSpinner text="Memeriksa akses admin..." isFullScreen size="lg" />
    );
  }

  if (!authState.authorized) {
    return <UnauthorizedPage email={authState.email} />;
  }

  return <>{children}</>;
}
