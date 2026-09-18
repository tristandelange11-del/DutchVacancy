import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiPost } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { beginSession } from "@/lib/session";
import type { User } from "@/lib/types";

const DEMOS = [
  { labelKey: "login.demoStudent", email: "student@dutchvacancy.nl", password: "Student123!" },
  { labelKey: "login.demoEmployer", email: "employer@picnic.nl", password: "Employer123!" },
];

export default function Login() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = useMutation({
    mutationFn: (creds: { email: string; password: string }) =>
      apiPost<User>("/auth/login", creds),
    onSuccess: async (user) => {
      await beginSession();
      toast.success(`${t("login.welcome")}, ${user.name.split(" ")[0]}`);
      navigate(user.role === "employer" ? "/employer/dashboard" : "/student/dashboard");
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: string })?.detail : null;
      toast.error(detail ?? t("login.failed"));
    },
  });

  return (
    <Layout>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-center">
        <div className="hidden rounded-3xl bg-navy p-10 text-slate-200 lg:block">
          <h2 className="font-heading text-3xl font-extrabold text-white">{t("login.sideTitle")}</h2>
          <p className="mt-4 leading-relaxed text-slate-300">{t("login.quote")}</p>
          <p className="mt-3 text-sm font-semibold text-primary">{t("login.quoteBy")}</p>
          <img
            src="https://images.pexels.com/photos/16254452/pexels-photo-16254452.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
            alt="Amsterdam tech office"
            className="mt-8 h-52 w-full rounded-2xl object-cover"
          />
        </div>

        <div className="rounded-3xl border border-border bg-card p-8">
          <h1 className="font-heading text-2xl font-extrabold">{t("login.title")}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t("login.lead")}</p>
          <form
            className="mt-7 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              login.mutate({ email, password });
            }}
          >
            <div>
              <Label htmlFor="email">{t("login.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required data-testid="login-email-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">{t("login.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required data-testid="login-password-input" className="mt-1.5" />
            </div>
            <Button type="submit" className="w-full" disabled={login.isPending} data-testid="login-submit-button">
              {login.isPending ? t("login.pending") : t("login.submit")}
            </Button>
          </form>

          <div className="mt-6 rounded-xl border border-dashed border-border p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("login.demo")}</p>
            <div className="mt-3 space-y-2">
              {DEMOS.map((d) => (
                <button
                  key={d.email}
                  type="button"
                  data-testid={`login-demo-${d.email.includes("student") ? "student" : "employer"}`}
                  onClick={() => {
                    setEmail(d.email);
                    setPassword(d.password);
                  }}
                  className="w-full rounded-lg bg-secondary px-3 py-2 text-left text-xs transition-colors duration-150 hover:bg-accent"
                >
                  <span className="font-semibold">{t(d.labelKey)}</span> — {d.email} / {d.password}
                </button>
              ))}
            </div>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {t("login.noAccount")}{" "}
            <Link to="/register" className="font-semibold text-primary hover:underline" data-testid="login-register-link">
              {t("login.createFree")}
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
