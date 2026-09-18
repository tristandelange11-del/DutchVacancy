import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, apiPost } from "@/lib/api";
import { beginSession } from "@/lib/session";
import { CITIES, type Role, type User } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function Register() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [role, setRole] = useState<Role>(params.get("role") === "employer" ? "employer" : "student");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company_name: "",
    company_city: "Amsterdam",
  });

  function set(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const register = useMutation({
    mutationFn: () =>
      apiPost<User>("/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        role,
        company_name: role === "employer" ? form.company_name : null,
        company_city: role === "employer" ? form.company_city : null,
      }),
    onSuccess: async (user) => {
      await beginSession();
      toast.success("Account created — welcome to DutchVacancy");
      navigate(user.role === "employer" ? "/employer/dashboard" : "/student/dashboard");
    },
    onError: (err) => {
      const body = err instanceof ApiError ? (err.body as { detail?: unknown }) : null;
      const detail = typeof body?.detail === "string" ? body.detail : "Could not create your account";
      toast.error(detail);
    },
  });

  return (
    <Layout>
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:items-start">
        <div className="hidden rounded-3xl bg-navy p-10 text-slate-200 lg:block">
          <h2 className="font-heading text-3xl font-extrabold text-white">
            Working in the Netherlands, step by step
          </h2>
          <ul className="mt-6 space-y-4 text-sm leading-relaxed">
            {[
              ["16 hours per week", "Non-EU students work 16h/week during term, or full-time in June–August."],
              ["TWV work permit", "Your employer arranges it at UWV — it costs you nothing."],
              ["BSN + Dutch IBAN", "Register at the gemeente, then open a bank account to get paid."],
              ["Zoekjaar", "Graduates get a 12-month orientation year to work without a permit."],
            ].map(([t, b]) => (
              <li key={t} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-heading font-bold text-white">{t}</p>
                <p className="mt-1 text-slate-300">{b}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-border bg-card p-8">
          <h1 className="font-heading text-2xl font-extrabold">Create your free account</h1>

          <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-secondary p-1.5" data-testid="register-role-switch">
            {(["student", "employer"] as Role[]).map((r) => (
              <button
                key={r}
                type="button"
                data-testid={`register-role-${r}`}
                onClick={() => setRole(r)}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm font-semibold capitalize transition-colors duration-150",
                  role === r ? "bg-card text-primary shadow-sm" : "text-muted-foreground",
                )}
              >
                I'm a {r}
              </button>
            ))}
          </div>

          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              register.mutate();
            }}
          >
            <div>
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required minLength={2} data-testid="register-name-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="remail">Email</Label>
              <Input id="remail" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} required data-testid="register-email-input" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="rpassword">Password (min. 6 characters)</Label>
              <Input id="rpassword" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} required minLength={6} data-testid="register-password-input" className="mt-1.5" />
            </div>

            {role === "employer" && (
              <>
                <div>
                  <Label htmlFor="company">Company name</Label>
                  <Input id="company" value={form.company_name} onChange={(e) => set("company_name", e.target.value)} required data-testid="register-company-input" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="ccity">Company city</Label>
                  <select
                    id="ccity"
                    value={form.company_city}
                    onChange={(e) => set("company_city", e.target.value)}
                    data-testid="register-company-city-select"
                    className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={register.isPending} data-testid="register-submit-button">
              {register.isPending ? "Creating…" : `Create ${role} account`}
            </Button>
          </form>

          <p className="mt-6 text-sm text-muted-foreground">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-primary hover:underline" data-testid="register-login-link">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  );
}
