"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutDashboard, BookOpen, Menu, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

const loggedOutLinks = [
  { href: "#courses", label: "Courses" },
  { href: "#testimonials", label: "Reviews" },
];

const loggedInLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/courses", label: "My Courses", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
];

export function Header() {
  const pathname = usePathname();
  const { isLoaded, isSignedIn } = useAuth();
  const showSignedIn = isLoaded && isSignedIn;
  const showSignedOut = isLoaded && !isSignedIn;

  return (
    <nav className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-5 max-w-7xl mx-auto">
      <div>
        {showSignedIn && (
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <Logo />
          </Link>
        )}
        {showSignedOut && (
          <Link href="/" className="flex items-center gap-3 group">
            <Logo />
          </Link>
        )}
      </div>

      <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {showSignedOut && (
          <div className="flex items-center gap-8 text-sm text-slate-400">
            {loggedOutLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-slate-900 transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {showSignedIn && (
          <div className="flex items-center gap-1">
            {loggedInLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href !== "/dashboard" && pathname.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                    isActive
                      ? "bg-blue-50 text-blue-700"
                      : "text-slate-400 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        {showSignedOut && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white border-slate-200"
              >
                {loggedOutLinks.map((link) => (
                  <DropdownMenuItem key={link.href} asChild>
                    <Link
                      href={link.href}
                      className="text-slate-600 cursor-pointer"
                    >
                      {link.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <SignInButton mode="modal">
              <Button
                variant="ghost"
                className="text-slate-500 hover:text-slate-900 hover:bg-slate-100"
              >
                Sign in
              </Button>
            </SignInButton>
            <Link href="/dashboard" className="hidden sm:block">
              <Button className="bg-gradient-to-r from-blue-600 to-sky-500 hover:from-blue-700 hover:to-sky-600 text-white border-0 shadow-lg shadow-blue-600/25">
                Start Learning
              </Button>
            </Link>
          </>
        )}

        {showSignedIn && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="md:hidden">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-white border-slate-200"
              >
                {loggedInLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/dashboard" &&
                      pathname.startsWith(link.href));

                  return (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-2 cursor-pointer",
                          isActive ? "text-blue-700" : "text-slate-600",
                        )}
                      >
                        <Icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 ring-2 ring-blue-500/20",
                },
              }}
            />
          </>
        )}
      </div>
    </nav>
  );
}
