import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Jobs from "@/pages/Jobs";
import JobDetail from "@/pages/JobDetail";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import StudentDashboard from "@/pages/StudentDashboard";
import EmployerDashboard from "@/pages/EmployerDashboard";
import VacancyForm from "@/pages/VacancyForm";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Guide from "@/pages/Guide";
import HowItWorks from "@/pages/HowItWorks";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import RequireRole from "@/components/RequireRole";
import { NotFound } from "@/components/Static";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/jobs" element={<Jobs />} />
      <Route path="/jobs/:jobId" element={<JobDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/guide" element={<Guide />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route
        path="/student/dashboard"
        element={
          <RequireRole role="student">
            <StudentDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/employer/dashboard"
        element={
          <RequireRole role="employer">
            <EmployerDashboard />
          </RequireRole>
        }
      />
      <Route
        path="/employer/vacancies/new"
        element={
          <RequireRole role="employer">
            <VacancyForm />
          </RequireRole>
        }
      />
      <Route
        path="/employer/vacancies/:jobId/edit"
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
