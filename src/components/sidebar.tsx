"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, useCallback, useSyncExternalStore, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Activity,
  LayoutDashboard,
  ListChecks,
  Clock,
  Calendar,
  MessageSquare,
  Brain,
  FolderOpen,
  Settings,
  Wrench,
  MessageCircle,
  Terminal,
  SquareTerminal,
  Cpu,
  Volume2,
  Database,
  Users,
  Users2,
  BarChart3,
  Menu,
  X,
  ShieldCheck,
  Package,
  ChevronRight,
  ChevronLeft,
  Waypoints,
  Globe,
  KeyRound,
  Search,
  Heart,
  Settings2,
  Webhook,
  Stethoscope,
  HelpCircle,
  Puzzle,
  Radio,
} from "lucide-react";
import { getChatUnreadCount, subscribeChatStore } from "@/lib/chat-store";
import { useTranslation } from "@/components/language-provider";

type NavItem = {
  section: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  tab?: string;
  isSubItem?: boolean;
  comingSoon?: boolean;
  beta?: boolean;
  group?: string;
};

const isAgentbayHosting = process.env.NEXT_PUBLIC_AGENTBAY_HOSTED === "true";



const SIDEBAR_COLLAPSED_KEY = "sidebar_collapsed";
const SIDEBAR_WIDTH_KEY = "sidebar_width";
const SIDEBAR_DEFAULT_WIDTH = 288;
const SIDEBAR_MIN_WIDTH = 260;
const SIDEBAR_MAX_WIDTH = 420;

function clampSidebarWidth(width: number) {
  return Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, width));
}

function deriveSectionFromPath(pathname: string): string | null {
  if (!pathname || pathname === "/") return null;
  if (pathname.startsWith("/skills/")) return "skills";
  const first = pathname.split("/").filter(Boolean)[0] || "";
  const aliases: Record<string, string> = {
    system: "dashboard",
    documents: "docs",
    memories: "memory",
    permissions: "security",
    heartbeat: "cron",
    models: "agents",
  };
  if (aliases[first]) return aliases[first];
  const known = new Set([
    "dashboard",
    "chat",
    "agents",
    "tasks",
    "calendar",
    "integrations",
    "sessions",
    "cron",
    "heartbeat",
    "memory",
    "docs",
    "vectors",
    "skills",
    "accounts",
    "channels",
    "audio",
    "browser",
    "search",
    "tailscale",
    "security",
    "permissions",
    "hooks",
    "doctor",
    "usage",
    "terminal",
    "logs",
    "config",
    "settings",
    "activity",
    "help",
  ]);
  return known.has(first) ? first : null;
}

function deriveTabFromPath(pathname: string): string | null {
  if (!pathname || pathname === "/") return null;
  const first = pathname.split("/").filter(Boolean)[0] || "";
  if (first === "heartbeat") return "heartbeat";
  if (first === "models") return "models";
  return null;
}

function SidebarNav({ onNavigate, collapsed }: { onNavigate?: () => void; collapsed?: boolean }) {
  const { t, language, setLanguage } = useTranslation();
  const searchParams = useSearchParams();

  const defaultNavItems: NavItem[] = [
    // ── Overview ──
    { group: t("sidebar.overview"), section: "dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard, href: "/dashboard" },
    { section: "activity", label: t("sidebar.activity"), icon: Activity, href: "/activity" },
    { section: "usage", label: t("sidebar.usage"), icon: BarChart3, href: "/usage" },
    // ── Agents ──
    { group: t("sidebar.agents_group"), section: "agents", label: t("sidebar.agents"), icon: Users, href: "/agents" },
    { section: "agents", label: t("sidebar.subagents"), icon: Users2, href: "/agents?tab=subagents", tab: "subagents", isSubItem: true },
    { section: "agents", label: t("sidebar.models"), icon: Cpu, href: "/agents?tab=models", tab: "models", isSubItem: true },
    { section: "chat", label: t("sidebar.chat"), icon: MessageCircle, href: "/chat" },
    { section: "sessions", label: t("sidebar.sessions"), icon: MessageSquare, href: "/sessions" },
    // ── Work ──
    { group: t("sidebar.work"), section: "tasks", label: t("sidebar.tasks"), icon: ListChecks, href: "/tasks" },
    ...(!isAgentbayHosting ? [{ section: "calendar", label: t("sidebar.calendar"), icon: Calendar, href: "/calendar", beta: true } as NavItem] : []),
    ...(!isAgentbayHosting ? [{ section: "integrations", label: t("sidebar.integrations"), icon: Puzzle, href: "/integrations", beta: true } as NavItem] : []),
    { section: "cron", label: t("sidebar.cron_jobs"), icon: Clock, href: "/cron" },
    { section: "cron", label: t("sidebar.heartbeat"), icon: Heart, href: "/heartbeat", tab: "heartbeat", isSubItem: true },
    { section: "skills", label: t("sidebar.skills"), icon: Wrench, href: "/skills" },
    { section: "skills", label: t("sidebar.clawhub"), icon: Package, href: "/skills?tab=clawhub", tab: "clawhub", isSubItem: true },
    // ── Knowledge ──
    { group: t("sidebar.knowledge"), section: "memory", label: t("sidebar.memory"), icon: Brain, href: "/memory" },
    { section: "docs", label: t("sidebar.documents"), icon: FolderOpen, href: "/documents" },
    { section: "vectors", label: t("sidebar.vector_db"), icon: Database, href: "/vectors" },
    // ── Configure ──
    { section: "accounts", label: t("sidebar.api_keys"), icon: KeyRound, href: "/accounts" },
    { section: "channels", label: t("sidebar.channels"), icon: Radio, href: "/channels" },
    { section: "security", label: t("sidebar.security"), icon: ShieldCheck, href: "/security" },
    { section: "hooks", label: t("sidebar.hooks"), icon: Webhook, href: "/hooks" },
    { section: "settings", label: t("sidebar.preferences"), icon: Settings2, href: "/settings" },
    // ── System ──
    ...(!isAgentbayHosting ? [{ section: "doctor", label: t("sidebar.doctor"), icon: Stethoscope, href: "/doctor", group: t("sidebar.system"), beta: true } as NavItem] : []),
    { group: isAgentbayHosting ? t("sidebar.system") : undefined, section: "terminal", label: t("sidebar.terminal"), icon: SquareTerminal, href: "/terminal" },
    { section: "logs", label: t("sidebar.logs"), icon: Terminal, href: "/logs" },
    { section: "browser", label: t("sidebar.browser_relay"), icon: Globe, href: "/browser" },
    { section: "audio", label: t("sidebar.audio_voice"), icon: Volume2, href: "/audio" },
    { section: "search", label: t("sidebar.web_search"), icon: Search, href: "/search" },
    ...(!isAgentbayHosting ? [{ section: "tailscale", label: t("sidebar.tailscale"), icon: Waypoints, href: "/tailscale", beta: true } as NavItem] : []),
    { section: "config", label: t("sidebar.config"), icon: Settings, href: "/config" },
  ];

  const hostedNavItems: NavItem[] = [
    // ── Core ──
    { group: t("sidebar.core"), section: "chat", label: t("sidebar.chat"), icon: MessageCircle, href: "/chat" },
    { section: "channels", label: t("sidebar.channels"), icon: Radio, href: "/channels" },
    { section: "tasks", label: t("sidebar.tasks"), icon: ListChecks, href: "/tasks" },
    { section: "skills", label: t("sidebar.skills"), icon: Wrench, href: "/skills" },
    { section: "accounts", label: t("sidebar.api_keys"), icon: KeyRound, href: "/accounts" },
    { section: "help", label: t("sidebar.help_support"), icon: HelpCircle, href: "/help" },
    // ── Overview ──
    { group: t("sidebar.overview"), section: "dashboard", label: t("sidebar.dashboard"), icon: LayoutDashboard, href: "/dashboard" },
    { section: "activity", label: t("sidebar.activity"), icon: Activity, href: "/activity" },
    { section: "usage", label: t("sidebar.usage"), icon: BarChart3, href: "/usage" },
    // ── Agents ──
    { group: t("sidebar.agents_group"), section: "agents", label: t("sidebar.agents"), icon: Users, href: "/agents" },
    { section: "agents", label: t("sidebar.models"), icon: Cpu, href: "/agents?tab=models", tab: "models", isSubItem: true },
    { section: "sessions", label: t("sidebar.sessions"), icon: MessageSquare, href: "/sessions" },
    // ── Work ──
    { group: t("sidebar.work"), section: "cron", label: t("sidebar.cron_jobs"), icon: Clock, href: "/cron" },
    // ── Knowledge ──
    { group: t("sidebar.knowledge"), section: "memory", label: t("sidebar.memory"), icon: Brain, href: "/memory" },
    { section: "docs", label: t("sidebar.documents"), icon: FolderOpen, href: "/documents" },
    // ── Configure ──
    { group: t("sidebar.configure"), section: "settings", label: t("sidebar.preferences"), icon: Settings2, href: "/settings" },
    // ── Advanced ──
    { group: t("sidebar.advanced"), section: "agents", label: t("sidebar.subagents"), icon: Users2, href: "/agents?tab=subagents", tab: "subagents" },
    { section: "skills", label: t("sidebar.clawhub"), icon: Package, href: "/skills?tab=clawhub", tab: "clawhub", group: t("sidebar.advanced") },
    { section: "cron", label: t("sidebar.heartbeat"), icon: Heart, href: "/heartbeat", tab: "heartbeat", group: t("sidebar.advanced") },
    { section: "vectors", label: t("sidebar.vector_db"), icon: Database, href: "/vectors", group: t("sidebar.advanced") },
    { section: "security", label: t("sidebar.security"), icon: ShieldCheck, href: "/security", group: t("sidebar.advanced") },
    { section: "hooks", label: t("sidebar.hooks"), icon: Webhook, href: "/hooks", group: t("sidebar.advanced") },
    { section: "terminal", label: t("sidebar.terminal"), icon: SquareTerminal, href: "/terminal", group: t("sidebar.advanced") },
    { section: "logs", label: t("sidebar.logs"), icon: Terminal, href: "/logs", group: t("sidebar.advanced") },
    { section: "browser", label: t("sidebar.browser_relay"), icon: Globe, href: "/browser", group: t("sidebar.advanced") },
    { section: "audio", label: t("sidebar.audio_voice"), icon: Volume2, href: "/audio", group: t("sidebar.advanced") },
    { section: "search", label: t("sidebar.web_search"), icon: Search, href: "/search", group: t("sidebar.advanced") },
    { section: "config", label: t("sidebar.config"), icon: Settings, href: "/config", group: t("sidebar.advanced") },
  ];

  const navItems = isAgentbayHosting ? hostedNavItems : defaultNavItems;

  const pathname = usePathname();
  const sectionFromPath = deriveSectionFromPath(pathname);
  const sectionFromQuery = searchParams.get("section") || "dashboard";
  const tabFromQuery = (searchParams.get("tab") || "").toLowerCase();
  const tabFromPath = deriveTabFromPath(pathname);
  const isSkillDetailRoute = pathname.startsWith("/skills/");
  const section = isSkillDetailRoute
    ? "skills"
    : sectionFromPath || sectionFromQuery;
  const tab = isSkillDetailRoute ? "skills" : (tabFromPath ?? tabFromQuery);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [agentsExpanded, setAgentsExpanded] = useState(false);
  const [cronExpanded, setCronExpanded] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);
  const isClawHubActive = section === "skills" && tab === "clawhub";
  const showSkillsChildren = isClawHubActive ? true : skillsExpanded;
  const isSubagentsActive = section === "agents" && tab === "subagents";
  const isModelsActive = section === "agents" && tab === "models";
  const showAgentsChildren = isSubagentsActive || isModelsActive ? true : agentsExpanded;
  const isHeartbeatActive = section === "cron" && tab === "heartbeat";
  const showCronChildren = isHeartbeatActive ? true : cronExpanded;

  // Subscribe to chat unread count reactively
  const chatUnread = useSyncExternalStore(
    subscribeChatStore,
    getChatUnreadCount,
    () => 0 // SSR fallback
  );

  return (
    <nav className={cn("flex flex-1 flex-col gap-0.5 overflow-y-auto pt-2", collapsed ? "px-2" : "px-3")}>
      {navItems.map((item, index) => {
        const isSkillsParent = item.section === "skills" && item.label === t("sidebar.skills");
        const isAgentsParent = item.section === "agents" && item.label === t("sidebar.agents");
        const isCronParent = item.section === "cron" && item.label === t("sidebar.cron_jobs");
        const isAdvancedItem = isAgentbayHosting && item.group === "Advanced";
        const previousGroup = index > 0 ? navItems[index - 1]?.group : undefined;
        const showGroupHeader = item.group && item.group !== previousGroup;
        const Icon = item.icon;
        const isActive =
          !item.comingSoon &&
          section === item.section &&
          (item.tab
            ? tab === item.tab
            : (item.section !== "skills" || tab !== "clawhub") &&
              (item.section !== "agents" || (tab !== "subagents" && tab !== "models")));
        const tourId =
          !item.isSubItem && item.section === "dashboard"
            ? "nav-dashboard"
            : !item.isSubItem && item.section === "chat"
              ? "nav-chat"
              : !item.isSubItem && item.section === "tasks"
                ? "nav-tasks"
                : !item.isSubItem && item.section === "skills" && item.label === "Skills"
                  ? "nav-skills"
                  : !item.isSubItem && item.section === "accounts"
                    ? "nav-accounts"
                    : !item.isSubItem && item.section === "channels"
                      ? "nav-channels"
                      : undefined;

        if (collapsed && item.isSubItem) return null;
        if (item.isSubItem && item.section === "skills" && !showSkillsChildren) return null;
        if (item.isSubItem && item.section === "agents" && !showAgentsChildren) return null;
        if (item.isSubItem && item.section === "cron" && !showCronChildren) return null;
        const shouldHideAdvancedItem = isAdvancedItem && !advancedExpanded && !isActive;
        if (shouldHideAdvancedItem && !showGroupHeader) return null;

        const showBadge = item.section === "chat" && chatUnread > 0;
        const isDisabled = item.comingSoon;
        const linkClass = cn(
          "group relative flex items-center gap-2 rounded-md py-1.5 text-xs font-medium transition-colors duration-150",
          collapsed ? "justify-center px-2" : "px-2.5",
          item.isSubItem && !collapsed && "ml-6 py-1",
          isDisabled
            ? "cursor-not-allowed opacity-50 text-stone-400 dark:text-stone-500"
            : isActive
              ? "bg-stone-100 text-stone-900 font-semibold dark:bg-[#171b1f] dark:text-[#f5f7fa]"
              : "text-stone-600 hover:bg-stone-100 hover:text-stone-900 dark:text-[#a8b0ba] dark:hover:bg-[#171b1f] dark:hover:text-[#f5f7fa]"
        );
        return (
          <div key={`${item.section}:${item.label}`}>
            {showGroupHeader && !collapsed && (
              isAgentbayHosting && item.group === "Advanced" ? (
                <button
                  type="button"
                  onClick={() => setAdvancedExpanded((prev) => !prev)}
                  className="mb-1.5 mt-4 first:mt-0 flex w-full items-center justify-between rounded-md px-2.5 py-1 text-xs font-semibold uppercase tracking-widest text-stone-400 transition-colors hover:bg-stone-100 hover:text-stone-600 dark:text-stone-500 dark:hover:bg-[#171b1f] dark:hover:text-[#a8b0ba]"
                  aria-expanded={advancedExpanded}
                >
                  <span>{t("sidebar.advanced")}</span>
                  <ChevronRight className={cn("h-3 w-3 transition-transform", advancedExpanded && "rotate-90")} />
                </button>
              ) : (
                <div className="mb-1.5 mt-4 first:mt-0 px-2.5 text-xs font-semibold uppercase tracking-widest text-stone-400 dark:text-stone-500">
                  {item.group}
                </div>
              )
            )}
            {showGroupHeader && collapsed && (
              <div className="my-2 mx-1 border-t border-stone-200 dark:border-[#23282e]" />
            )}
            {shouldHideAdvancedItem ? null : isDisabled ? (
              <span className={linkClass} aria-disabled>
                <Icon className="h-3 w-3 shrink-0 opacity-60" />
                {!collapsed && (
                  <>
                    <span className="min-w-0 flex-1 truncate">{item.label}</span>
                    <span className="shrink-0 whitespace-nowrap rounded-full border border-border bg-muted/50 px-1.5 py-0.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {t("common.soon")}
                    </span>
                  </>
                )}
              </span>
            ) : (
              (isSkillsParent || isAgentsParent || isCronParent) && !collapsed ? (
                <div className={linkClass} data-tour={tourId}>
                  <Link
                    href={item.href || `/${item.section}`}
                    onClick={onNavigate}
                    className="flex min-w-0 flex-1 items-center gap-2.5"
                  >
                    <Icon className="h-3 w-3 shrink-0" />
                    <span className="flex-1">{item.label}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (isSkillsParent) {
                        setSkillsExpanded((prev) => !prev);
                      } else if (isAgentsParent) {
                        setAgentsExpanded((prev) => !prev);
                      } else {
                        setCronExpanded((prev) => !prev);
                      }
                    }}
                    className="rounded-md p-1.5 text-foreground/60 transition-colors hover:text-foreground"
                    aria-label={
                      isSkillsParent
                        ? (showSkillsChildren ? "Collapse skills submenu" : "Expand skills submenu")
                        : isAgentsParent
                          ? (showAgentsChildren ? "Collapse agents submenu" : "Expand agents submenu")
                          : (showCronChildren ? "Collapse cron submenu" : "Expand cron submenu")
                    }
                  >
                    <ChevronRight
                      className={cn(
                        "h-3 w-3 shrink-0 transition-transform duration-200",
                        (isSkillsParent ? showSkillsChildren : isAgentsParent ? showAgentsChildren : showCronChildren) && "rotate-90"
                      )}
                    />
                  </button>
                </div>
              ) : (
                <Link
                  href={item.href || `/${item.section}`}
                  onClick={onNavigate}
                  className={linkClass}
                  data-tour={tourId}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="relative inline-flex shrink-0">
                    <Icon className="h-3 w-3" />
                    {collapsed && showBadge && (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-stone-900 ring-2 ring-sidebar dark:bg-stone-100" title={`${chatUnread} unread`} aria-hidden />
                  )}
                </span>
                {!collapsed && <span className="flex-1">{item.label}</span>}
                {!collapsed && item.beta && (
                    <span className="shrink-0 rounded-sm bg-stone-100 px-1.5 py-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-stone-400 dark:bg-[#1c2128] dark:text-[#5a6270]">
                      beta
                    </span>
                  )}
                {!collapsed && showBadge && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-stone-900 px-1.5 text-xs font-bold text-white shadow-sm dark:bg-stone-100 dark:text-stone-900">
                      {chatUnread > 9 ? "9+" : chatUnread}
                    </span>
                  )}
                </Link>
              )
            )}
          </div>
        );
      })}
    </nav>
  );
}

export function Sidebar() {
  const { language, setLanguage, t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
  });
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") return SIDEBAR_DEFAULT_WIDTH;
    const raw = Number(localStorage.getItem(SIDEBAR_WIDTH_KEY));
    return Number.isFinite(raw) && raw > 0 ? clampSidebarWidth(raw) : SIDEBAR_DEFAULT_WIDTH;
  });
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(null);

  const closeMobile = useCallback(() => setMobileOpen(false), []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);
  const commitHash = process.env.NEXT_PUBLIC_COMMIT_HASH || "";

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  useEffect(() => {
    if (collapsed) return;
    try {
      localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
    } catch {
      /* ignore */
    }
  }, [sidebarWidth, collapsed]);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const active = resizeStateRef.current;
      if (!active) return;
      const nextWidth = clampSidebarWidth(active.startWidth + (event.clientX - active.startX));
      setSidebarWidth(nextWidth);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    };

    const handlePointerUp = () => {
      if (!resizeStateRef.current) return;
      resizeStateRef.current = null;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, []);

  const startResize = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (collapsed) return;
    resizeStateRef.current = { startX: event.clientX, startWidth: sidebarWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }, [collapsed, sidebarWidth]);

  const expandedWidthStyle = collapsed
    ? undefined
    : {
        width: `${sidebarWidth}px`,
        minWidth: `${sidebarWidth}px`,
      };

  return (
    <>
      {/* Mobile hamburger — visible only on small screens */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-3 top-3 z-50 flex h-9 w-9 items-center justify-center rounded-lg glass-strong text-foreground md:hidden"
        aria-label={t("common.open_menu")}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar — always visible on desktop, slide-in drawer on mobile */}
      <aside
        data-tour="sidebar"
        style={expandedWidthStyle}
        className={cn(
          "relative flex h-full shrink-0 flex-col transition-[width,transform] duration-200 ease-in-out",
          "border-r border-stone-200 bg-stone-50 dark:border-[#23282e] dark:bg-[#0d0f12]",
          collapsed ? "w-14 md:w-14" : "w-72 md:w-72",
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-50 max-md:shadow-2xl",
          mobileOpen ? "max-md:translate-x-0" : "max-md:-translate-x-full"
        )}
      >
        {/* Mobile close button */}
        <div className={cn("flex items-center pt-3 md:hidden", collapsed ? "justify-center px-2" : "justify-end px-3")}>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
            aria-label={t("common.close_menu")}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className={cn("shrink-0", collapsed ? "px-2 pb-2" : "px-3 pb-3 pt-3")}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base shadow-sm ring-1 ring-stone-200 dark:bg-[#171a1d] dark:ring-[#2c343d]">
                🦞
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-base shadow-sm ring-1 ring-stone-200 dark:bg-[#171a1d] dark:ring-[#2c343d]">
                  🦞
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold tracking-tight text-stone-900 dark:text-[#f5f7fa]">
                      Mission Control
                    </span>
                    {commitHash && (
                      <span className="shrink-0 rounded-full bg-stone-100 px-1.5 py-0.5 text-xs font-mono font-medium text-stone-500 dark:bg-[#171a1d] dark:text-[#7a8591]">
                        {commitHash}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <Suspense fallback={<div className="flex-1" />}>
          <SidebarNav onNavigate={closeMobile} collapsed={collapsed} />
        </Suspense>
        {/* Language Switcher */}
        <div className={cn("border-t border-stone-200 dark:border-[#23282e]", collapsed ? "px-2 py-2" : "px-3 py-2")}>
          <button
            type="button"
            onClick={() => setLanguage(language === "en" ? "zh" : "en")}
            className={cn(
              "flex w-full items-center rounded-md py-1.5 text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 dark:text-[#7a8591] dark:hover:bg-[#171b1f] dark:hover:text-[#d6dce3]",
              collapsed ? "justify-center px-0" : "justify-start px-2.5"
            )}
            title={language === "en" ? t("common.switch_to_chinese") : t("common.switch_to_english")}
          >
            <Globe className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <span className="ml-3 text-sm font-medium">
                {language === "en" ? "English" : "简体中文"}
              </span>
            )}
          </button>
        </div>
        {/* Collapse / expand toggle — desktop only */}
        <div className={cn("hidden border-t border-stone-200 dark:border-[#23282e] md:block", collapsed ? "px-2 py-2" : "px-3 py-2")}>
          <button
            type="button"
            onClick={toggleCollapsed}
            className={cn(
              "flex w-full items-center rounded-md py-1.5 text-stone-400 transition-colors duration-150 hover:bg-stone-100 hover:text-stone-700 dark:text-[#7a8591] dark:hover:bg-[#171b1f] dark:hover:text-[#d6dce3]",
              collapsed ? "justify-center px-0" : "justify-start px-2.5"
            )}
            title={collapsed ? t("common.expand_sidebar") : t("common.collapse_sidebar")}
            aria-label={collapsed ? t("common.expand_sidebar") : t("common.collapse_sidebar")}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronLeft className="h-4 w-4 shrink-0" />
            )}
          </button>
        </div>
        {!collapsed && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            onPointerDown={startResize}
            className="absolute inset-y-0 right-0 hidden w-2 -translate-x-1/2 cursor-col-resize md:block"
          >
            <div className="mx-auto h-full w-px bg-transparent transition-colors hover:bg-stone-300 dark:hover:bg-[#3d4752]" />
          </div>
        )}
      </aside>
    </>
  );
}

export { Sidebar as AppSidebar };
