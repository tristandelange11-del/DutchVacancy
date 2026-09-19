import Layout from "@/components/Layout";
import { PageHero, Prose, Section, TextSection } from "@/components/Static";
import { useLang } from "@/lib/i18n";
import { useSeo } from "@/lib/seo";

export default function HowItWorks() {
  const { t, tl } = useLang();
  useSeo({
    title: "How DutchVacancy Works",
    description:
      "How students apply and how employers post vacancies on DutchVacancy — from creating a profile and uploading a CV to reviewing applicants in the employer dashboard.",
  });
  return (
    <Layout>
      <PageHero eyebrow={t("how.eyebrow")} title={t("how.title")} intro={t("how.intro")} />
      <Prose testid="how-it-works-page">
        <Section title={t("how.studentsTitle")}>
          <ol className="list-decimal space-y-2 pl-5" data-testid="how-student-steps">
            {tl("how.studentSteps").map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </Section>
        <Section title={t("how.employersTitle")}>
          <ol className="list-decimal space-y-2 pl-5" data-testid="how-employer-steps">
            {tl("how.employerSteps").map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </Section>
        <TextSection titleKey="how.costTitle" bodyKey="how.costBody" />
      </Prose>
    </Layout>
  );
}
