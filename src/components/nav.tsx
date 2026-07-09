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
  UsersRound,
  Wrench,
  Backpack,
  Trophy,
  MapPin,
  Settings,
  Shield,
  LogOut,
  UserCircle2,
  Menu,
  Search,
  MessageCircle,
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

const primary = (fishId: boolean) => [
  { href: "/home", label: "Home", icon: Home },
  { href: "/fish", label: "Find Fish", icon: Fish },
  ...(fishId ? [{ href: "/identify", label: "Identify", icon: Camera }] : []),
  { href: "/gear", label: "Gear", icon: Wrench },
  { href: "/conditions", label: "Conditions", icon: CloudSun },
  { href: "/trips", label: "Trips", icon: CalendarDays },
  { href: "/boards", label: "Bite Boards", icon: Users },
  { href: "/crews", label: "Crews", icon: UsersRound },
  { href: "/forum", label: "Forum", icon: MessageCircle },
];

const personal = [
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/search", label: "Find Anglers", icon: Search },
  { href: "/my-gear", label: "My Gear", icon: Backpack },
  { href: "/catches", label: "My Catches", icon: Trophy },
  { href: "/spots", label: "Saved Spots", icon: MapPin },
  { href: "/settings", label: "Profile & Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function TopNav({
  user,
  fishId = false,
  unread = 0,
}: {
  user: NavUser;
  fishId?: boolean;
  unread?: number;
}) {
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
    <header className="sticky top-0 z-40 bg-black border-b border-neutral-800">
      <div className="mx-auto max-w-6xl px-4 h-20 flex items-center gap-4">
        <Logo dark />
        <nav className="hidden md:flex items-center gap-1 ml-4">
          {primary(fishId).map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                isActive(pathname, href)
                  ? "bg-blue-900 text-white"
                  : "text-slate-200 hover:text-white hover:bg-neutral-900"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user && (
            <>
              <Link
                href="/search"
                aria-label="Find anglers"
                className={`hidden sm:grid place-items-center size-10 rounded-full transition-colors ${
                  isActive(pathname, "/search") ? "bg-blue-900 text-white" : "text-slate-200 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <Search className="size-5" />
              </Link>
              <Link
                href="/messages"
                aria-label="Messages"
                className={`relative grid place-items-center size-10 rounded-full transition-colors ${
                  isActive(pathname, "/messages") ? "bg-blue-900 text-white" : "text-slate-200 hover:text-white hover:bg-neutral-900"
                }`}
              >
                <MessageCircle className="size-5" />
                {unread > 0 && (
                  <span className="absolute top-1.5 right-1.5 min-w-4 h-4 px-1 rounded-full bg-bait-500 text-white text-[10px] font-bold grid place-items-center">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Link>
            </>
          )}
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-950 pl-1.5 pr-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-900"
                aria-expanded={menuOpen}
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="size-7 rounded-full object-cover" />
                ) : (
                  <UserCircle2 className="size-7 text-slate-300" />
                )}
                <span className="hidden sm:inline max-w-28 truncate">{user.name}</span>
                <Menu className="size-4 text-slate-300 sm:hidden" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-lift border border-sand-200 py-2 animate-fade-up">
                  {/* mobile-only: primary nav lives in the top bar on desktop, but is
                      hidden on phones — surface it here so Forum/Boards/Crews stay reachable */}
                  <div className="md:hidden border-b border-sand-100 pb-2 mb-2">
                    {primary(fishId).map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-ink-900 hover:bg-sand-100"
                      >
                        <Icon className="size-4 text-ink-500" /> {label}
                      </Link>
                    ))}
                  </div>
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
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-200 hover:text-white"
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

export function MobileTabs({ user, fishId = false }: { user: NavUser; fishId?: boolean }) {
  const pathname = usePathname();
  const tabs = [
    { href: "/home", label: "Home", icon: Home },
    { href: "/fish", label: "Find Fish", icon: Fish },
    fishId
      ? { href: "/identify", label: "Identify", icon: Camera }
      : { href: "/catches", label: "Catches", icon: Trophy },
    { href: "/conditions", label: "Conditions", icon: CloudSun },
    user?.username
      ? { href: `/u/${user.username}`, label: "Profile", icon: UserCircle2 }
      : { href: "/login", label: "Profile", icon: UserCircle2 },
  ];
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-black border-t border-neutral-800 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center gap-1 py-2.5 text-[11px] font-semibold ${
                active ? "text-blue-300" : "text-slate-300"
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
