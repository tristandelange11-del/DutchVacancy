import { useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Bookmark, ClipboardList, UserRound } from "lucide-react";
import { toast } from "sonner";
import Layout from "@/components/Layout";
import JobCard from "@/components/JobCard";
import CvUploadField from "@/components/CvUploadField";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { apiGet, apiPut } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { useToggleSave } from "@/lib/hooks";
import { useLang } from "@/lib/i18n";
import { SESSION_KEY, useSession } from "@/lib/session";
import {
  STATUS_CLASSES,
  type Application,
  type JobWithMeta,
  type StudentProfile,
  type User,
} from "@/lib/types";

export default function StudentDashboard() {
  const { user } = useSession();
  const { t, lang } = useLang();
  const toggleSave = useToggleSave();

  const applications = useQuery({
    queryKey: ["applications"],
    queryFn: () => apiGet<Application[]>("/student/applications"),
  });
  const saved = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => apiGet<JobWithMeta[]>("/student/saved-jobs"),
  });

  const [profile, setProfile] = useState<StudentProfile>(
    user?.profile ?? {
      university: "",
      study: "",
      city: "",
      english_level: "fluent",
      cv_url: "",
      cv_filename: "",
      bio: "",
      phone: "",
    },
  );

  const saveProfile = useMutation({
    mutationFn: () => apiPut<User>("/auth/profile", profile),
    onSuccess: () => {
      toast.success(t("sd.profileSaved"));
      queryClient.invalidateQueries({ queryKey: SESSION_KEY });
    },
    onError: () => toast.error(t("sd.profileFailed")),
  });

  const apps = applications.data ?? [];
  const savedJobs = saved.data ?? [];

  return (
    <Layout>
      <div className="bg-navy py-10 text-slate-100">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-200">{t("sd.eyebrow")}</p>
          <h1 className="mt-2 font-heading text-3xl font-extrabold" data-testid="student-dashboard-heading">
            {t("sd.hi")} {user?.name.split(" ")[0] ?? ""} 👋
          </h1>
          <div className="mt-6 grid grid-cols-3 gap-3 sm:max-w-lg">
            {[
              { label: t("sd.statApplications"), value: apps.length, testid: "student-stat-applications" },
              { label: t("sd.statSaved"), value: savedJobs.length, testid: "student-stat-saved" },
              { label: t("sd.statInterviews"), value: apps.filter((a) => a.status === "interview").length, testid: "student-stat-interviews" },
            ].map((s) => (
              <div key={s.testid} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-heading text-2xl font-extrabold text-primary" data-testid={s.testid}>{s.value}</p>
                <p className="text-xs text-slate-300">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <Tabs defaultValue="applications">
          <TabsList variant="line" data-testid="student-tabs">
            <TabsTrigger value="applications" data-testid="student-tab-applications" className="gap-2">
              <ClipboardList className="h-4 w-4" /> {t("sd.tabApplications")}
            </TabsTrigger>
            <TabsTrigger value="saved" data-testid="student-tab-saved" className="gap-2">
              <Bookmark className="h-4 w-4" /> {t("sd.tabSaved")}
            </TabsTrigger>
            <TabsTrigger value="profile" data-testid="student-tab-profile" className="gap-2">
              <UserRound className="h-4 w-4" /> {t("sd.tabProfile")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="applications" className="pt-7">
            {apps.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center" data-testid="student-applications-empty">
                <h3 className="font-heading text-lg font-bold">{t("sd.emptyAppsTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("sd.emptyAppsBody")}</p>
                <Link to="/jobs" className={buttonVariants({ className: "mt-5" })} data-testid="student-browse-jobs-link">
                  {t("sd.browse")}
                </Link>
              </div>
            ) : (
              <div className="space-y-3" data-testid="student-applications-list">
                {apps.map((a) => (
                  <div
                    key={a.id}
                    data-testid={`application-row-${a.id}`}
                    className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 transition-shadow duration-200 hover:shadow-md"
                  >
                    <div className="min-w-0 flex-1">
                      <Link to={`/jobs/${a.job_id}`} className="font-heading text-base font-bold hover:text-primary">
                        {a.job_title}
                      </Link>
                      <p className="text-sm text-muted-foreground">{a.company_name}</p>
                      <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">{a.motivation}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={STATUS_CLASSES[a.status]} data-testid={`application-status-${a.id}`}>
                        {t(`label.${a.status}`)}
                      </Badge>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleDateString(lang === "nl" ? "nl-NL" : "en-GB")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved" className="pt-7">
            {savedJobs.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border p-12 text-center" data-testid="student-saved-empty">
                <h3 className="font-heading text-lg font-bold">{t("sd.emptySavedTitle")}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{t("sd.emptySavedBody")}</p>
              </div>
            ) : (
              <div className="grid gap-5 sm:grid-cols-2" data-testid="student-saved-list">
                {savedJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onToggleSave={(j) =>
                      toggleSave.mutate(j, { onSuccess: () => toast.success(t("toast.unsaved")) })
                    }
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="profile" className="pt-7">
            <form
              className="max-w-2xl space-y-4 rounded-2xl border border-border bg-card p-6"
              data-testid="student-profile-form"
              onSubmit={(e) => {
                e.preventDefault();
                saveProfile.mutate();
              }}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="university">{t("sd.university")}</Label>
                  <Input id="university" value={profile.university} onChange={(e) => setProfile({ ...profile, university: e.target.value })} data-testid="profile-university-input" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="study">{t("sd.study")}</Label>
                  <Input id="study" value={profile.study} onChange={(e) => setProfile({ ...profile, study: e.target.value })} data-testid="profile-study-input" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="pcity">{t("sd.city")}</Label>
                  <Input id="pcity" value={profile.city} onChange={(e) => setProfile({ ...profile, city: e.target.value })} data-testid="profile-city-input" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="english">{t("sd.englishLevel")}</Label>
                  <select
                    id="english"
                    value={profile.english_level}
                    onChange={(e) => setProfile({ ...profile, english_level: e.target.value })}
                    data-testid="profile-english-select"
                    className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
                  >
                    {["native", "fluent", "advanced", "intermediate"].map((v) => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="phone">{t("sd.phone")}</Label>
                  <Input id="phone" value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} data-testid="profile-phone-input" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>{t("sd.cv")}</Label>
                <div className="mt-1.5">
                  <CvUploadField
                    url={profile.cv_url}
                    filename={profile.cv_filename}
                    testidPrefix="profile"
                    onChange={(next) =>
                      setProfile({ ...profile, cv_url: next.url, cv_filename: next.filename })
                    }
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="bio">{t("sd.bio")}</Label>
                <Textarea id="bio" rows={4} value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} data-testid="profile-bio-input" className="mt-1.5" />
              </div>
              <Button type="submit" disabled={saveProfile.isPending} data-testid="profile-save-button">
                {saveProfile.isPending ? t("common.saving") : t("sd.saveProfile")}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
