"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, BookOpen, Settings, LogOut,
  GraduationCap, Wallet, ClipboardList, School, Menu, X,
  BookMarked, FileText, IdCard, CalendarDays, UserCog,
  ChevronRight, Inbox, FileBarChart, Upload
} from "lucide-react";

type NavItem = { name: string; href: string; icon: React.ElementType };

function getLinks(role: string | undefined): NavItem[] {
  if (role === "SUPER_ADMIN" || role === "ADMIN") return [
    { name: "Dashboard",      href: "/admin/dashboard",       icon: LayoutDashboard },
    { name: "Students",       href: "/admin/students",        icon: GraduationCap   },
    { name: "Teachers",       href: "/admin/teachers",        icon: Users           },
    { name: "Classes",        href: "/admin/classes",         icon: BookOpen        },
    { name: "Subjects",       href: "/admin/subjects",        icon: BookMarked      },
    { name: "Fee Records",    href: "/admin/fees",            icon: Wallet          },
    { name: "Results",        href: "/admin/results",         icon: ClipboardList   },
    { name: "Academic Years", href: "/admin/academic-years",  icon: CalendarDays    },
    { name: "Admissions",     href: "/admin/admissions",      icon: Inbox           },
    { name: "Documents",      href: "/admin/documents",       icon: FileText        },
    { name: "ID Cards",       href: "/admin/id-cards",        icon: IdCard          },
    { name: "Reports",        href: "/admin/reports",         icon: FileBarChart    },
    { name: "Users",          href: "/admin/users",           icon: UserCog         },
    { name: "Settings",       href: "/admin/settings",        icon: Settings        },
  ];
  if (role === "TEACHER") return [
    { name: "Dashboard",      href: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "My Classes",     href: "/teacher/classes",   icon: BookOpen        },
    { name: "Students",       href: "/teacher/students",  icon: Users           },
    { name: "Upload Results", href: "/teacher/results",   icon: Upload          },
  ];
  return [
    { name: "Dashboard",  href: "/student/dashboard", icon: LayoutDashboard },
    { name: "My Results", href: "/student/results",   icon: ClipboardList   },
    { name: "Fee Status", href: "/student/fees",      icon: Wallet          },
  ];
}

function roleLabel(role: string | undefined) {
  const map: Record<string, string> = {
    SUPER_ADMIN: "Super Admin", ADMIN: "Admin",
    TEACHER: "Ustaza", STUDENT: "Student", GUARDIAN: "Guardian",
  };
  return map[role ?? ""] ?? "User";
}

interface SidebarContentProps {
  name: string | null | undefined;
  email: string | null | undefined;
  role: string | undefined;
  onClose?: () => void;
}

function SidebarContent({ name, email, role, onClose }: SidebarContentProps) {
  const pathname = usePathname();
  const links = getLinks(role);
  const initials = (name ?? email ?? "U")
    .split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex flex-col h-full gradient-animated shadow-2xl border-r border-white/5 relative z-20">
      {/* Gold gradient top bar */}
      <div className="h-1 w-full flex-shrink-0"
        style={{ background: "linear-gradient(90deg, #D4A017, #F5C842, #D4A017)" }} />

      {/* Brand header */}
      <div className="px-4 py-4 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D4A017, #F5C842)" }}>
            <School className="w-5 h-5" style={{ color: "#07301A" }} />
          </div>
          <div>
            <p className="font-bold text-sm leading-tight text-white">Jamia SMS</p>
            <p className="text-[10px] font-medium" style={{ color: "#D4A017" }}>Khadijatul Kubra</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg transition-colors"
            style={{ color: "rgba(255,255,255,0.5)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.08)")}
            onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase tracking-widest px-3 py-2"
          style={{ color: "rgba(255,255,255,0.25)" }}>
          Menu
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          const active = pathname === link.href || (link.href !== "/admin/dashboard" && link.href !== "/teacher/dashboard" && link.href !== "/student/dashboard" && pathname.startsWith(link.href));

          return (
            <Link key={link.href} href={link.href} onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative hover-lift"
              style={active ? {
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(8px)",
                color: "#F5C842",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                border: "1px solid rgba(255,255,255,0.05)"
              } : {
                color: "rgba(255,255,255,0.7)",
              }}
              onMouseEnter={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)";
                  (e.currentTarget as HTMLElement).style.color = "white";
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
                }
              }}
            >
              {/* Active left border indicator */}
              {active && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: "#D4A017" }} />
              )}

              {/* Icon box */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                style={active ? {
                  background: "linear-gradient(135deg, rgba(212, 160, 23, 0.3), rgba(212, 160, 23, 0.1))",
                  boxShadow: "0 2px 10px rgba(212,160,23,0.2)"
                } : {
                  background: "rgba(255,255,255,0.04)",
                }}>
                <Icon className="w-4 h-4 transition-colors" style={active ? { color: "#F5C842" } : {}} />
              </div>
              <span className="truncate group-hover:text-white transition-colors">{link.name}</span>

              {active && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#D4A017" }} />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-3 flex-shrink-0 space-y-2"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
          style={{ background: "rgba(255,255,255,0.06)" }}>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #D4A017, #F5C842)", color: "#07301A" }}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white truncate">{name ?? email?.split("@")[0]}</p>
            <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ background: "rgba(212,160,23,0.2)", color: "#D4A017" }}>
              {roleLabel(role)}
            </span>
          </div>
        </div>

        {/* Sign out */}
        <a href="/api/logout"
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 w-full"
          style={{ color: "rgba(255,255,255,0.4)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.15)";
            (e.currentTarget as HTMLElement).style.color = "#FCA5A5";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.4)";
          }}
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "rgba(255,255,255,0.05)" }}>
            <LogOut className="w-4 h-4" />
          </div>
          Sign Out
        </a>
      </div>
    </div>
  );
}

export function SidebarClient({
  name, email, role,
}: { name: string | null | undefined; email: string | null | undefined; role: string | undefined }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 flex-shrink-0 flex-col h-screen sticky top-0 overflow-hidden shadow-xl"
        style={{ borderRight: "1px solid rgba(255,255,255,0.05)" }}>
        <SidebarContent name={name} email={email} role={role} />
      </aside>

      {/* Mobile hamburger */}
      <button onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
        style={{ background: "#07301A", border: "1px solid rgba(212,160,23,0.3)" }}>
        <Menu className="w-5 h-5 text-white" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 flex-shrink-0 shadow-2xl">
            <SidebarContent name={name} email={email} role={role} onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
