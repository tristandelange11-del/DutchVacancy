import Layout from "@/components/Layout";
import { PageHero, Prose, Section } from "@/components/Static";

export default function Terms() {
  return (
    <Layout>
      <PageHero
        eyebrow="Terms of service"
        title="The rules for using DutchVacancy"
        intro="Last updated: 1 January 2026. By creating an account you agree to these terms."
      />
      <Prose testid="terms-page">
        <Section title="Using the platform">
          <p>
            You need an account to apply to vacancies or publish them. Keep your login details to
            yourself, give accurate information, and use one account per person or company.
          </p>
        </Section>
        <Section title="Student obligations">
          <p>
            You are responsible for checking that a role fits your residence permit and your
            permitted working hours. Apply only to roles you genuinely intend to take, and never
            misrepresent your studies, permit status or work experience.
          </p>
        </Section>
        <Section title="Employer obligations">
          <p>
            Vacancies must be real, must state the English requirement, hours and hourly rate
            accurately, and must comply with Dutch employment law — including minimum wage, holiday
            allowance and equal-treatment rules. You may not charge students any fee, and you may not
            use applicant data for anything other than the role they applied to.
          </p>
        </Section>
        <Section title="Content we remove">
          <p>
            We remove listings that are discriminatory, misleading, unpaid where pay is legally
            required, pyramid-style, or that require the candidate to pay for a permit, training or
            equipment.
          </p>
        </Section>
        <Section title="No employment guarantee">
          <p>
            DutchVacancy is a marketplace, not an employer or agency. We do not guarantee that a
            vacancy leads to an offer, nor that an applicant is suitable, and we are not a party to
            any employment contract you enter into.
          </p>
        </Section>
        <Section title="Liability and law">
          <p>
            The service is provided “as is”. To the extent permitted by law, our liability is limited
            to direct damage up to € 250. These terms are governed by Dutch law, with the courts of
            Amsterdam having jurisdiction.
          </p>
        </Section>
      </Prose>
    </Layout>
  );
}
