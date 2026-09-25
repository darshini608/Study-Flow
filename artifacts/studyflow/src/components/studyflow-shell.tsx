import { BookOpen, Brain, CalendarDays, ChevronRight, Clock3, Compass, Gauge, Lightbulb, Menu, Settings, Sparkles, Target, X } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { Link, useLocation } from 'wouter';
import { useStudyFlow } from '@/lib/studyflow-store';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: Gauge },
  { href: '/planner', label: 'Plan', icon: CalendarDays },
  { href: '/subjects', label: 'Subjects', icon: BookOpen },
  { href: '/focus', label: 'Focus', icon: Clock3 },
  { href: '/assistant', label: 'Assistant', icon: Brain },
  { href: '/progress', label: 'Progress', icon: Target },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
];

export function AppShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { settings } = useStudyFlow();
  const [open, setOpen] = useState(false);
  const initials = settings.studentName.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[252px] flex-col border-r border-border bg-card px-4 py-5 transition-transform duration-300 md:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-3">
          <Link href="/dashboard" className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Compass size={18} strokeWidth={2.5} /></span>
            <span className="font-serif text-[24px] leading-none tracking-[-.03em]">StudyFlow</span>
          </Link>
          <button onClick={() => setOpen(false)} className="rounded-lg p-2 text-muted-foreground md:hidden" aria-label="Close navigation" data-testid="button-close-navigation"><X size={18} /></button>
        </div>
        <div className="mt-10 px-3 text-[10px] font-bold uppercase tracking-[.2em] text-muted-foreground">Your workspace</div>
        <nav className="mt-3 space-y-1" aria-label="Main navigation">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location === item.href;
            return <Link key={item.href} href={item.href} onClick={() => setOpen(false)} className={`group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${active ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} data-testid={`link-nav-${item.label.toLowerCase()}`}>
              <span className="flex items-center gap-3"><Icon size={17} strokeWidth={active ? 2.3 : 1.8} />{item.label}</span>
              {active && <ChevronRight size={15} />}
            </Link>;
          })}
        </nav>
        <div className="mt-auto">
          <div className="mb-4 rounded-2xl border border-border bg-secondary/60 p-4">
            <div className="mb-2 flex items-center gap-2 text-primary"><Sparkles size={15} /><span className="text-xs font-bold">Small steps count</span></div>
            <p className="text-xs leading-5 text-muted-foreground">A realistic plan is one you can return to.</p>
          </div>
          <Link href="/settings" onClick={() => setOpen(false)} className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${location === '/settings' ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`} data-testid="link-nav-settings">
            <Settings size={17} /> Settings
          </Link>
          <div className="mt-4 flex items-center gap-3 border-t border-border px-3 pt-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-extrabold text-accent-foreground">{initials}</span>
            <div className="min-w-0"><p className="truncate text-sm font-bold" data-testid="text-sidebar-name">{settings.studentName}</p><p className="text-xs text-muted-foreground">Student workspace</p></div>
          </div>
        </div>
      </aside>
      <div className="md:pl-[252px]">
        <header className="sticky top-0 z-30 flex h-[68px] items-center justify-between border-b border-border/80 bg-background/90 px-5 backdrop-blur-md md:px-10">
          <button onClick={() => setOpen(true)} className="rounded-xl p-2 text-muted-foreground hover:bg-muted md:hidden" aria-label="Open navigation" data-testid="button-open-navigation"><Menu size={21} /></button>
          <div className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground md:flex"><span className="h-2 w-2 rounded-full bg-primary" /> Personal workspace <span className="text-border">/</span> {navItems.find(item => item.href === location)?.label ?? 'Settings'}</div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/assistant" className="hidden items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary hover:text-primary sm:flex" data-testid="link-header-assistant"><Brain size={14} /> Ask for help</Link>
            <Link href="/settings" className="grid h-9 w-9 place-items-center rounded-full bg-accent text-xs font-extrabold text-accent-foreground" aria-label="Open settings" data-testid="link-header-profile">{initials}</Link>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-7 md:px-10 md:py-10">{children}</main>
      </div>
      {open && <button className="fixed inset-0 z-30 bg-foreground/20 md:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" data-testid="button-navigation-overlay" />}
    </div>
  );
}