import { Link, NavLink, useNavigate } from "react-router-dom";
import { Briefcase, LayoutDashboard, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { endSession, useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Browse Jobs", to: "/jobs" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "Student Guide", to: "/guide" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group" data-testid="brand-logo">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:-rotate-6">
        <Briefcase className="h-4.5 w-4.5" />
      </span>
      <span className="font-heading text-lg font-extrabold tracking-tight">
        Dutch<span className="text-primary">Vacancy</span>
      </span>
    </Link>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user } = useSession();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const dashboardPath = user?.role === "employer" ? "/employer/dashboard" : "/student/dashboard";

  async function handleLogout() {
    await endSession();
    setOpen(false);
    navigate("/");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/85 backdrop-blur-lg">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-6 px-4 sm:px-6 lg:h-18">
          <Logo />
          <nav className="hidden items-center gap-1 lg:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                data-testid={`nav-link-${item.to.replace("/", "")}`}
                className={({ isActive }) =>
                  cn(
                    "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground",
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  data-testid="nav-dashboard-link"
                  className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "gap-2")}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {user.name.split(" ")[0]}
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleLogout}
                  data-testid="nav-logout-button"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  data-testid="nav-login-link"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  data-testid="nav-register-link"
                  className={buttonVariants({ size: "sm" })}
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            data-testid="mobile-menu-toggle"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto grid h-10 w-10 place-items-center rounded-lg border border-border lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="border-t border-border bg-background px-4 pb-4 lg:hidden" data-testid="mobile-menu">
            <nav className="flex flex-col py-2">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setOpen(false)}
                  data-testid={`mobile-nav-${item.to.replace("/", "")}`}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="flex gap-2 pt-2">
              {user ? (
                <>
                  <Link
                    to={dashboardPath}
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
                    data-testid="mobile-dashboard-link"
                  >
                    Dashboard
                  </Link>
                  <Button size="sm" className="flex-1" onClick={handleLogout} data-testid="mobile-logout-button">
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1")}
                    data-testid="mobile-login-link"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className={cn(buttonVariants({ size: "sm" }), "flex-1")}
                    data-testid="mobile-register-link"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 border-t border-border bg-navy text-slate-300">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
          <div className="md:col-span-2">
            <span className="font-heading text-xl font-extrabold text-white">
              Dutch<span className="text-primary">Vacancy</span>
            </span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-400">
              The job board for international students in the Netherlands. Every vacancy states its
              English requirement and work-permit support up front — no guessing, no dead ends.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Students</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/jobs" className="hover:text-primary" data-testid="footer-jobs-link">Browse jobs</Link></li>
              <li><Link to="/guide" className="hover:text-primary" data-testid="footer-guide-link">Work permits & rules</Link></li>
              <li><Link to="/how-it-works" className="hover:text-primary" data-testid="footer-how-link">How it works</Link></li>
              <li><Link to="/register" className="hover:text-primary" data-testid="footer-register-link">Create an account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.12em] text-slate-500">Company</h4>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link to="/about" className="hover:text-primary" data-testid="footer-about-link">About us</Link></li>
              <li><Link to="/contact" className="hover:text-primary" data-testid="footer-contact-link">Contact</Link></li>
              <li><Link to="/privacy" className="hover:text-primary" data-testid="footer-privacy-link">Privacy policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary" data-testid="footer-terms-link">Terms of service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} DutchVacancy — Amsterdam, the Netherlands. Not affiliated with IND or UWV.
        </div>
      </footer>
      <Toaster richColors />
    </div>
  );
}
