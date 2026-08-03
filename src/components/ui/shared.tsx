// Shared design system components for Jamia SMS
// Premium Islamic-themed component library

// ─── Page Header ────────────────────────────────────────────────────────────
interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}
export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground text-sm mt-1">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}

// ─── Stat Card ───────────────────────────────────────────────────────────────
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  badge?: string;
  badgeColor?: string;
  iconBg?: string;
  iconColor?: string;
  footer?: string;
}
export function StatCard({
  title, value, icon: Icon, badge, badgeColor = "text-emerald-700 bg-emerald-500/10",
  iconBg = "bg-primary/10", iconColor = "text-primary", footer,
}: StatCardProps) {
  return (
    <div className="stat-card glass-card card-hover rounded-2xl p-5 relative overflow-hidden group">
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center icon-float backdrop-blur-md border border-white/20 shadow-sm`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm font-medium">{title}</p>
      <p className="text-3xl font-bold text-foreground mt-1">{value}</p>
      {footer && <p className="text-xs text-muted-foreground mt-2">{footer}</p>}
    </div>
  );
}

// ─── Section Card ────────────────────────────────────────────────────────────
interface SectionCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  headerRight?: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}
export function SectionCard({ title, description, children, headerRight, className = "", noPadding }: SectionCardProps) {
  return (
    <div className={`glass-panel rounded-2xl overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-border/50 flex items-center justify-between bg-white/40 dark:bg-black/20">
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        {headerRight}
      </div>
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );
}

// ─── Status Badge ────────────────────────────────────────────────────────────
type StatusType = "success" | "warning" | "danger" | "info" | "neutral";
const statusStyles: Record<StatusType, string> = {
  success: "bg-emerald-500/15 text-emerald-700 border border-emerald-500/20 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-700 border border-amber-500/20 dark:text-amber-400",
  danger: "bg-red-500/15 text-red-700 border border-red-500/20 dark:text-red-400",
  info: "bg-blue-500/15 text-blue-700 border border-blue-500/20 dark:text-blue-400",
  neutral: "bg-muted/50 text-muted-foreground border border-border/50",
};
export function StatusBadge({ label, type = "neutral" }: { label: string; type?: StatusType }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${statusStyles[type]}`}>
      {label}
    </span>
  );
}

// ─── Avatar ──────────────────────────────────────────────────────────────────
export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials = name.split(" ").map(s => s[0]).join("").toUpperCase().slice(0, 2);
  const sizeClasses = { sm: "w-7 h-7 text-[10px]", md: "w-9 h-9 text-xs", lg: "w-11 h-11 text-sm" };
  // Pick a color based on first char
  const colors = ["from-emerald-500 to-green-600", "from-blue-500 to-indigo-600", "from-violet-500 to-purple-600", "from-amber-500 to-yellow-600", "from-rose-500 to-pink-600"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`${sizeClasses[size]} rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold flex-shrink-0 shadow-md hover:scale-110 transition-transform duration-300 ring-2 ring-white/20 dark:ring-black/20`}>
      {initials}
    </div>
  );
}

// ─── Empty State ─────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }: { icon: React.ElementType; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground opacity-50" />
      </div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-xs mb-4">{description}</p>
      {action}
    </div>
  );
}

// ─── Table ───────────────────────────────────────────────────────────────────
export function TableWrapper({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto glass-panel rounded-2xl">{children}</div>;
}
export function Table({ children }: { children: React.ReactNode }) {
  return <table className="w-full text-sm text-left">{children}</table>;
}
export function Thead({ cols }: { cols: string[] }) {
  return (
    <thead className="bg-white/40 dark:bg-black/20 border-b border-border/50 backdrop-blur-md">
      <tr>
        {cols.map(col => (
          <th key={col} className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap">
            {col}
          </th>
        ))}
      </tr>
    </thead>
  );
}
export function Tbody({ children }: { children: React.ReactNode }) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}
export function Tr({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <tr className={`hover:bg-muted/30 transition-colors ${className}`}>{children}</tr>;
}
export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-6 py-4 ${className}`}>{children}</td>;
}

// ─── Action Button ───────────────────────────────────────────────────────────
interface ActionBtnProps { href?: string; onClick?: () => void; children: React.ReactNode; variant?: "primary" | "outline"; }
import Link from "next/link";
export function ActionBtn({ href, children, variant = "primary" }: { href?: string; children: React.ReactNode; variant?: "primary" | "outline" }) {
  const base = "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover-lift";
  const primary = "bg-gradient-to-r from-primary to-primary/90 text-primary-foreground btn-glow";
  const outline = "glass-panel text-foreground hover:bg-white/50 dark:hover:bg-black/30 border-border/50";
  const cls = `${base} ${variant === "primary" ? primary : outline}`;
  if (href) return <Link href={href} className={cls}>{children}</Link>;
  return <button className={cls}>{children}</button>;
}

// ─── Progress Bar ────────────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color = "bg-primary" }: { value: number; max?: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className="h-2 bg-muted rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  );
}

// ─── Info Row ────────────────────────────────────────────────────────────────
export function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex justify-between py-3 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}
