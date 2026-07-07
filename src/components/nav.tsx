"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Fish,
  Camera,
  CloudSun,
  CalendarDays,
  Users,
  Backpack,
  Trophy,
  MapPin,
  Settings,
  Shield,
  LogOut,
  UserCircle2,
  Menu,
} from "lucide-react";
import { Logo } from "./logo";
import { signOutAction } from "@/lib/actions/signout";

export type NavUser = {
  id: string;
  name: string;
  username: string | null;
  role: "user" | "admin";
  avatarUrl: string | null;
} | null;

const primary = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/fish", label: "Find Fish", icon: Fish },
  { href: "/identify", label: "Identify", icon: Camera },
  { href: "/conditions", label: "Conditions", icon: CloudSun },
  { href: "/trips", label: "Trips", icon: CalendarDays },
  { href: "/community", label: "Community", icon: Users },
];

const personal = [
  { href: "/gear", label: "My Gear", icon: Backpack },
  { href: "/catches", label: "My Catches", icon: Trophy },
  { href: "/spots", label: "Saved Spots", icon: MapPin },
  { href: "/settings", label: "Profile & Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-40 bg-tide-950/95 backdrop-blur border-b border-tide-800">
      <div className="mx-auto max-w-6xl px-4 h-16 flex items-center gap-4">
        <Logo dark />
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {primary.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(pathname, href)
                  ? "bg-tide-800 text-white"
                  : "text-tide-200 hover:text-white hover:bg-tide-900"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-tide-700 bg-tide-900 pl-1.5 pr-3 py-1.5 text-sm font-semibold text-white hover:bg-tide-800"
                aria-expanded={menuOpen}
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
                ) : (
                  <UserCircle2 className="size-7 text-tide-300" />
                )}
                <span className="hidden sm:inline max-w-28 truncate">{user.name}</span>
                <Menu className="size-4 text-tide-300 sm:hidden" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-lift border border-sand-200 py-2 animate-fade-up">
                  {user.username && (
                    <Link
                      href={`/u/${user.username}`}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-sand-100"
                    >
                      <UserCircle2 className="size-4 text-ink-500" /> My Profile
                    </Link>
                  )}
                  {personal.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-sand-100"
                    >
                      <Icon className="size-4 text-ink-500" /> {label}
                    </Link>
                  ))}
                  {user.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-sand-100"
                    >
                      <Shield className="size-4 text-ink-500" /> Admin
                    </Link>
                  )}
                  <form action={signOutAction}>
                    <button className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50">
                      <LogOut className="size-4" /> Sign out
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-semibold text-tide-200 hover:text-white"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-xl bg-bait-500 hover:bg-bait-600 px-4 py-2 text-sm font-bold text-white"
              >
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileTabs({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/fish", label: "Find Fish", icon: Fish },
    { href: "/identify", label: "Identify", icon: Camera },
    { href: "/conditions", label: "Conditions", icon: CloudSun },
    user?.username
      ? { href: `/u/${user.username}`, label: "Profile", icon: UserCircle2 }
      : { href: "/login", label: "Profile", icon: UserCircle2 },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-tide-950/97 backdrop-blur border-t border-tide-800 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                active ? "text-bait-400" : "text-tide-300"
              }`}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
