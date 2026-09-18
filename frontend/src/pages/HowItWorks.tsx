import Layout from "@/components/Layout";
import { PageHero, Prose, Section } from "@/components/Static";

export default function HowItWorks() {
  return (
    <Layout>
      <PageHero
        eyebrow="How it works"
        title="From signing up to your first Dutch payslip"
        intro="The same platform serves two audiences. Here is exactly what happens on each side."
      />
      <Prose testid="how-it-works-page">
        <Section title="For international students">
          <ol className="list-decimal space-y-2 pl-5">
            <li><strong>Create a free student account.</strong> Name, email and a password — that's it.</li>
            <li><strong>Complete your profile.</strong> University, study programme, city, English level and a CV link. It is reused on every application.</li>
            <li><strong>Filter honestly.</strong> Pick “English only” and, if you are non-EU, “TWV permit support”. What's left is genuinely reachable.</li>
            <li><strong>Apply with a motivation note.</strong> The employer sees your name, university, CV link and your note.</li>
            <li><strong>Track the outcome.</strong> Applied → under review → interview → offer, all in your dashboard.</li>
          </ol>
        </Section>
        <Section title="For Dutch employers">
          <ol className="list-decimal space-y-2 pl-5">
            <li><strong>Register an employer account</strong> with your company name and city.</li>
            <li><strong>Publish a vacancy</strong> — title, city, job type, hours, hourly range, English requirement and permit support.</li>
            <li><strong>Keep drafts private.</strong> Uncheck “publish” while you're still writing; nothing is visible until you're ready.</li>
            <li><strong>Review applicants</strong> in one pipeline, open CVs, and move candidates through the stages.</li>
            <li><strong>Edit or unpublish anytime.</strong> A filled role should stop attracting applications.</li>
          </ol>
        </Section>
        <Section title="What it costs">
          <p>
            Free for students, always. Employer listings are free during our launch period in the
            Netherlands.
          </p>
        </Section>
      </Prose>
    </Layout>
  );
}
