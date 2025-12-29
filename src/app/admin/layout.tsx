"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  LogOut,
  Menu,
  X,
  HelpCircle,
  FileText,
} from "lucide-react";
import { useState } from "react";
import { useData } from "@/contexts/DataContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAdmin, logout } = useData();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAdmin && pathname !== "/admin") {
      router.push("/admin");
    }
  }, [isAdmin, pathname, router]);

  const handleLogout = () => {
    logout();
    router.push("/admin");
  };

  const navItems = [
    { path: "/admin/boshqaruv", icon: LayoutDashboard, label: "Boshqaruv" },
    { path: "/admin/mavzular", icon: FileText, label: "Mavzular" },
    { path: "/admin/savollar", icon: HelpCircle, label: "Savollar" },
    { path: "/admin/javoblar", icon: MessageSquare, label: "Javoblar" },
  ];

  const isActive = (path: string) =>
    pathname === path || pathname.startsWith(path + "/");

  // For login page, just render children without admin layout
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-semibold text-sidebar-foreground">
                Akademik yozuv
              </h1>
              <p className="text-xs text-muted-foreground">
                Virtual laboratoriya
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden ml-auto p-1 hover:bg-sidebar-accent rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${
                  isActive(item.path) ? "active" : ""
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="sidebar-link w-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <LogOut className="w-5 h-5" />
              Chiqish
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center gap-4 px-4 py-3 bg-card border-b border-border">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-semibold">Akademik yozuv</h1>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
