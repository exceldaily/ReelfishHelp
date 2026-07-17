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
  Search,
  MessageCircle,
  MessagesSquare,
  ChevronDown,
} from "lucide-react";
import { Logo } from "./logo";
import { NotificationBell } from "./notification-bell";
import { signOutAction } from "@/lib/actions/signout";

export type NavUser = {
  id: string;
  name: string;
  username: string | null;
  role: "user" | "admin";
  avatarUrl: string | null;
} | null;

type NavItemDef = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

/** Shark-tooth icon for bite Reports (lucide has no tooth glyph). */
function SharkTooth({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d="M4.5 5h15c-1.7 6-4.8 11.3-7.5 14.6C9.3 16.3 6.2 11 4.5 5Z" />
      <path d="M6 8.5h12" />
    </svg>
  );
}

/** Always visible on desktop (>= lg). Order matters. */
const primaryMain: NavItemDef[] = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/fish", label: "Find Fish", icon: Fish },
  { href: "/conditions", label: "Conditions", icon: CloudSun },
  { href: "/boards", label: "Reports", icon: SharkTooth },
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
  "flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-300";
const navItemIdle = "text-slate-200 hover:text-white hover:bg-slate-800/80";
const navItemActive = "bg-blue-900 text-white";

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
      <Icon className="size-[18px]" />
      {item.label}
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
    <header className="sticky top-0 z-40 bg-black border-b border-neutral-800">
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
                  isActive(pathname, "/search") ? "bg-blue-900 text-white" : "text-slate-200 hover:text-white hover:bg-slate-800/80"
                }`}
              >
                <Search className="size-5" />
              </Link>
              <NotificationBell initialUnread={unreadNotifications} />
              <Link
                href="/messages"
                aria-label="Messages"
                className={`relative grid place-items-center size-10 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tide-300 ${
                  isActive(pathname, "/messages") ? "bg-blue-900 text-white" : "text-slate-200 hover:text-white hover:bg-slate-800/80"
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
                <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-lift border border-sand-200 py-2 animate-fade-up">
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
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-black border-t border-neutral-800 pb-[env(safe-area-inset-bottom)]">
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
