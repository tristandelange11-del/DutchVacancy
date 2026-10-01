import { lazy, Suspense, useEffect } from "react";
import { Route, Routes } from "@/lib/router";
import { PREFIXED_LANG } from "@/lib/paths";
import Home from "@/pages/Home";
import RequireRole from "@/components/RequireRole";
import { NotFound } from "@/components/Static";
import { PageLoading } from "@/components/PageLoading";

// The home page ships in the main bundle; every other page is its own chunk, loaded
// when it is first opened, so the first visit downloads only what it shows.
const loadJobs = () => import("@/pages/Jobs");
const loadJobDetail = () => import("@/pages/JobDetail");
const Jobs = lazy(loadJobs);
const JobDetail = lazy(loadJobDetail);
const Login = lazy(() => import("@/pages/Login"));
const Register = lazy(() => import("@/pages/Register"));
const StudentDashboard = lazy(() => import("@/pages/StudentDashboard"));
const EmployerDashboard = lazy(() => import("@/pages/EmployerDashboard"));
const InterviewPick = lazy(() => import("@/pages/InterviewPick"));
const VacancyForm = lazy(() => import("@/pages/VacancyForm"));
const About = lazy(() => import("@/pages/About"));
const Contact = lazy(() => import("@/pages/Contact"));
const Employers = lazy(() => import("@/pages/Employers"));
const Guide = lazy(() => import("@/pages/Guide"));
const GuideArticle = lazy(() => import("@/pages/GuideArticle"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const Privacy = lazy(() => import("@/pages/Privacy"));
const Terms = lazy(() => import("@/pages/Terms"));
const ForgotPassword = lazy(() => import("@/pages/ForgotPassword"));
const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
const VerifyEmail = lazy(() => import("@/pages/VerifyEmail"));

/** Every page, relative to the language prefix ("" or "/en"). */
function AppRoutes() {
  return (
    <Routes>
      <Route index element={<Home />} />
      <Route path="jobs" element={<Jobs />} />
      <Route path="jobs/:jobId" element={<JobDetail />} />
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="forgot-password" element={<ForgotPassword />} />
      <Route path="reset-password" element={<ResetPassword />} />
      <Route path="verify-email" element={<VerifyEmail />} />
      <Route path="how-it-works" element={<HowItWorks />} />
      <Route path="guide" element={<Guide />} />
      <Route path="guide/:slug" element={<GuideArticle />} />
      <Route path="employers" element={<Employers />} />
      <Route path="about" element={<About />} />
      <Route path="contact" element={<Contact />} />
      <Route path="privacy" element={<Privacy />} />
      <Route path="terms" element={<Terms />} />
      <Route
        path="student/dashboard"
        element={
          <RequireRole role="student">
            <StudentDashboard />
          </RequireRole>
        }
      />
      <Route
        path="student/applications/:appId/interview"
        element={
          <RequireRole role="student">
            <InterviewPick />
          </RequireRole>
        }
      />
      <Route
        path="employer/dashboard"
        element={
          <RequireRole role="employer">
            <EmployerDashboard />
          </RequireRole>
        }
      />
      <Route
        path="employer/vacancies/new"
        element={
          <RequireRole role="employer">
            <VacancyForm />
          </RequireRole>
        }
      />
      <Route
        path="employer/vacancies/:jobId/edit"
        element={
          <RequireRole role="employer">
            <VacancyForm />
          </RequireRole>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default function App() {
  // Most visits go on to the vacancies: fetch those two pages once the browser is idle.
  useEffect(() => {
    const prefetch = () => {
      void loadJobs();
      void loadJobDetail();
    };
    // Older Safari has no requestIdleCallback: a short delay does the same job there.
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(prefetch, { timeout: 4000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(prefetch, 2000);
    return () => clearTimeout(id);
  }, []);

  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path={`/${PREFIXED_LANG}/*`} element={<AppRoutes />} />
        <Route path="/*" element={<AppRoutes />} />
      </Routes>
    </Suspense>
  );
}
