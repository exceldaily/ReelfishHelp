"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Home,
  Fish,
  Camera,
  CloudSun,
  Route,
  UsersRound,
  Backpack,
  Box,
  Trophy,
  MapPin,
  Settings,
  Shield,
  LogOut,
  UserCircle2,
  Menu,
  Radar,
  Search,
  MessageCircle,
  MessagesSquare,
  ChevronDown,
} from "lucide-react";
import { Logo } from "./logo";
import { NotificationBell } from "./notification-bell";
import { RegionSwitcher } from "./region-switcher";
import { signOutAction } from "@/lib/actions/signout";
import type { Region } from "@/lib/regions";

export type NavUser = {
  id: string;
  name: string;
  username: string | null;
  role: "user" | "admin";
  avatarUrl: string | null;
  region: Region;
} | null;

type NavItemDef = {
  href: string;
  label: string;
  /** Compact label for the tight lg..1399px desktop band. */
  shortLabel?: string;
  icon: React.ComponentType<{ className?: string }>;
};

/** Always visible on desktop (>= lg). Order matters. */
const primaryMain: NavItemDef[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/fish", label: "Find Fish", icon: Fish },
  { href: "/conditions", label: "Conditions", icon: CloudSun },
  { href: "/boards", label: "Bite Reports", shortLabel: "Bites", icon: Radar },
  { href: "/gear", label: "Gear", icon: Backpack },
];

/** Inline at >= xl; folded into the "More" menu on narrower desktops. */
const primarySecondary = (fishId: boolean): NavItemDef[] => [
  ...(fishId ? [{ href: "/identify", label: "Identify", icon: Camera }] : []),
  { href: "/trips", label: "Trips", icon: Route },
  { href: "/crews", label: "Crews", icon: UsersRound },
  { href: "/forum", label: "Forum", icon: MessagesSquare },
];

/** Everything, for the mobile avatar-menu list. */
const primaryAll = (fishId: boolean): NavItemDef[] => [...primaryMain, ...primarySecondary(fishId)];

const personal: NavItemDef[] = [
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/search", label: "Find Anglers", icon: Search },
  { href: "/my-gear", label: "My Gear", icon: Box },
  { href: "/catches", label: "My Catches", icon: Trophy },
  { href: "/spots", label: "Saved Spots", icon: MapPin },
  { href: "/settings", label: "Profile & Settings", icon: Settings },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

/** Shared desktop nav-item styling: one metric for every link. */
const navItemBase =
  "relative flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-300";
const navItemIdle = "text-white/90 hover:text-white hover:bg-white/10";
/** Active: white text, teal icon + underline, faint navy wash — no filled pill. */
const navItemActive =
  "text-white bg-white/10 after:content-[''] after:absolute after:inset-x-3 after:bottom-0 after:h-[2.5px] after:rounded-full after:bg-reef-300 after:shadow-[0_0_8px_rgba(143,189,190,0.9)]";

function DesktopNavLink({
  item,
  pathname,
  className = "",
}: {
  item: NavItemDef;
  pathname: string;
  className?: string;
}) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`${navItemBase} ${active ? navItemActive : navItemIdle} ${className}`}
    >
      <Icon className={`size-[18px] ${active ? "text-reef-300" : ""}`} />
      {/* the full row is width-critical below ~1400px — fall back to the short label there */}
      {item.shortLabel ? (
        <>
          <span className="hidden min-[1400px]:inline">{item.label}</span>
          <span className="min-[1400px]:hidden">{item.shortLabel}</span>
        </>
      ) : (
        item.label
      )}
    </Link>
  );
}

/** "More" dropdown for the lg..xl band, holding the lower-priority items. */
function MoreMenu({ items, pathname }: { items: NavItemDef[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const anyActive = items.some((i) => isActive(pathname, i.href));

  return (
    <div className="relative min-[1360px]:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="More navigation"
        className={`${navItemBase} ${anyActive ? navItemActive : navItemIdle}`}
      >
        More
        <ChevronDown className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute left-0 z-50 mt-2 w-48 rounded-xl bg-white shadow-lift border border-sand-200 py-1.5 animate-fade-up"
        >
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              aria-current={isActive(pathname, href) ? "page" : undefined}
              className={`flex items-center gap-2.5 whitespace-nowrap px-4 py-2.5 text-sm font-semibold hover:bg-sand-100 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-tide-500 ${
                isActive(pathname, href) ? "text-tide-800 bg-tide-50" : "text-ink-900"
              }`}
            >
              <Icon className="size-[18px] text-ink-500" /> {label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function TopNav({
  user,
  fishId = false,
  unread = 0,
  unreadNotifications = 0,
}: {
  user: NavUser;
  fishId?: boolean;
  unread?: number;
  unreadNotifications?: number;
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

  const secondary = primarySecondary(fishId);

  return (
    <header className="sticky top-0 z-40 bg-black border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 h-20 flex items-center gap-4">
        <Logo dark />
        {/* >= 1360px: all eight items inline (the full row + header controls need
            ~1330px). lg..1359px: five priority items plus a More menu holding
            Trips/Crews/Forum. < lg: the avatar menu + bottom tabs. */}
        <nav aria-label="Primary" className="hidden lg:flex items-center gap-1 ml-4">
          {primaryMain.map((item) => (
            <DesktopNavLink key={item.href} item={item} pathname={pathname} />
          ))}
          {secondary.map((item) => (
            <DesktopNavLink key={item.href} item={item} pathname={pathname} className="hidden min-[1360px]:flex" />
          ))}
          <MoreMenu items={secondary} pathname={pathname} />
        </nav>
        <div className="ml-auto flex items-center gap-2">
          {user && (
            <>
              <Link
                href="/search"
                aria-label="Find anglers"
                className={`hidden sm:grid place-items-center size-10 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-300 ${
                  isActive(pathname, "/search") ? "bg-white/10 text-reef-300" : "text-white/90 hover:text-white hover:bg-white/10"
                }`}
              >
                <Search className="size-5" />
              </Link>
              <NotificationBell initialUnread={unreadNotifications} />
              <Link
                href="/messages"
                aria-label="Messages"
                className={`relative grid place-items-center size-10 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-300 ${
                  isActive(pathname, "/messages") ? "bg-white/10 text-reef-300" : "text-white/90 hover:text-white hover:bg-white/10"
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
                className="flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-950 pl-1.5 pr-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-300"
                aria-expanded={menuOpen}
              >
                {user.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="" className="size-7 shrink-0 rounded-full object-cover" />
                ) : (
                  <UserCircle2 className="size-7 text-slate-300" />
                )}
                {/* the name competes with the full nav in the 1024-1119px band — show the
                    avatar alone there */}
                <span className="hidden sm:inline lg:hidden min-[1120px]:inline max-w-28 truncate">{user.name}</span>
                <Menu className="size-4 text-slate-300 sm:hidden" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-lift border border-sand-200 py-2 animate-fade-up max-h-[calc(100dvh-6.5rem)] overflow-y-auto overscroll-contain">
                  {/* phones: the menu is long, so the region toggle leads to stay visible */}
                  <div className="lg:hidden border-b border-sand-100 pb-1 mb-1">
                    <RegionSwitcher current={user.region} />
                  </div>
                  {/* below lg: primary nav lives in the top bar on desktop, but is
                      hidden on phones/tablets — surface it here so everything stays reachable */}
                  <div className="lg:hidden border-b border-sand-100 pb-2 mb-2">
                    {primaryAll(fishId).map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        aria-current={isActive(pathname, href) ? "page" : undefined}
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
                  <div className="hidden lg:block border-t border-sand-100 mt-1 pt-1">
                    <RegionSwitcher current={user.region} />
                  </div>
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
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-200 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-300"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center whitespace-nowrap rounded-xl bg-bait-500 hover:bg-bait-600 px-4 py-2.5 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-300"
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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black border-t border-white/10 pb-[env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-5">
        {tabs.map(({ href, label, icon: Icon }) => {
          const active = isActive(pathname, href);
          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
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
