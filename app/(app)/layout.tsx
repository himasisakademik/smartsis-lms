import { SanityLive } from "@/sanity/lib/live";
import { ClerkProvider } from "@clerk/nextjs";
import { TutorWidget } from "@/components/tutor/TutorWidget";

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      afterSignOutUrl="/"
      appearance={{
        variables: {
          colorPrimary: "#1d4ed8",
          colorBackground: "#ffffff",
          colorInput: "#f8fafc",
          colorInputForeground: "#0f172a",
          colorForeground: "#0f172a",
          colorMutedForeground: "#64748b",
          colorDanger: "#dc2626",
          colorSuccess: "#16a34a",
          borderRadius: "0.75rem",
          fontFamily: "inherit",
        },
        elements: {
          card: {
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            boxShadow: "0 4px 24px -4px rgba(15, 23, 42, 0.08)",
          },
          userButtonPopoverCard: {
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
          },
          userButtonPopoverActionButton: {
            color: "#64748b",
            "&:hover": {
              backgroundColor: "#f1f5f9",
              color: "#0f172a",
            },
          },
          userPreviewMainIdentifier: {
            color: "#0f172a",
          },
          userPreviewSecondaryIdentifier: {
            color: "#94a3b8",
          },
          navbarButton: {
            color: "#64748b",
            "&:hover": {
              backgroundColor: "#f1f5f9",
              color: "#0f172a",
            },
          },
          navbarButtonActive: {
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
          },
          headerTitle: {
            color: "#0f172a",
          },
          headerSubtitle: {
            color: "#94a3b8",
          },
          formButtonPrimary: {
            backgroundColor: "#1d4ed8",
            "&:hover": {
              backgroundColor: "#1e40af",
            },
          },
          formFieldLabel: {
            color: "#64748b",
          },
          formFieldInput: {
            backgroundColor: "#f8fafc",
            borderColor: "#e2e8f0",
            color: "#0f172a",
            "&:focus": {
              borderColor: "#1d4ed8",
              boxShadow: "0 0 0 3px rgba(29, 78, 216, 0.15)",
            },
          },
          profileSectionTitle: {
            color: "#0f172a",
            borderBottomColor: "#e2e8f0",
          },
          profileSectionContent: {
            color: "#64748b",
          },
          badge: {
            backgroundColor: "#eff6ff",
            color: "#1d4ed8",
            border: "1px solid #bfdbfe",
          },
          footerActionLink: {
            color: "#1d4ed8",
            "&:hover": {
              color: "#2563eb",
            },
          },
          footer: {
            "& + div": {
              background: "transparent",
            },
          },
        },
      }}
    >
      <div>{children}</div>
      <SanityLive />
      <TutorWidget />
    </ClerkProvider>
  );
}

export default AppLayout;
