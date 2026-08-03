import { auth } from "@/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Bell, Search } from "lucide-react";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const name = session?.user?.name ?? session?.user?.email ?? "User";
  const initials = name.split(" ").map((s: string) => s[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Navbar */}
        <header className="h-16 flex-shrink-0 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shadow-sm">
          {/* Left spacer for mobile hamburger */}
          <div className="flex items-center gap-3 pl-10 lg:pl-0">
            <div>
              <p className="text-xs text-muted-foreground hidden sm:block">{today}</p>
              <h2 className="text-sm font-semibold text-foreground">
                Welcome, <span className="text-primary">{name.split(" ")[0]}</span> 👋
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Search - hidden on small screens */}
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Quick search..."
                className="w-48 lg:w-56 h-9 pl-9 pr-4 rounded-lg bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            {/* Notifications */}
            <button className="relative w-9 h-9 rounded-lg bg-muted border border-border flex items-center justify-center hover:bg-primary/10 transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent border-2 border-card" />
            </button>

            {/* Avatar */}
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center text-white font-bold text-sm cursor-pointer flex-shrink-0">
              {initials}
            </div>
          </div>
        </header>

        {/* Main content - scrollable */}
        <main className="flex-1 overflow-auto">
          <div className="p-4 sm:p-6 lg:p-8 max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
