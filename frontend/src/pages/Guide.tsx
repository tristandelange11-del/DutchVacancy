import Layout from "@/components/Layout";
import { PageHero, Prose, Section } from "@/components/Static";

export default function Guide() {
  return (
    <Layout>
      <PageHero
        eyebrow="Student guide"
        title="Working in the Netherlands as an international student"
        intro="Permits, hours, BSN and taxes — the essentials in plain English. Always confirm details with the IND, UWV or your university's international office."
      />
      <Prose testid="guide-page">
        <Section title="How many hours may I work?">
          <p>
            If you are from outside the EU/EEA or Switzerland, you may either work a maximum of
            <strong> 16 hours per week all year</strong>, or work <strong>full-time during June, July
            and August only</strong>. You must choose one option — you cannot combine them in the
            same calendar year.
          </p>
          <p>
            EU/EEA and Swiss students have no hour limit and need no work permit, though a very high
            income can affect student finance eligibility.
          </p>
        </Section>
        <Section title="The TWV work permit">
          <p>
            Non-EU students need a TWV (tewerkstellingsvergunning). Your <strong>employer</strong>
            {" "}applies for it at UWV — you cannot apply yourself, and it should never cost you money.
            Processing usually takes a few weeks, so start early. Vacancies on DutchVacancy are
            labelled when the employer offers TWV support.
          </p>
        </Section>
        <Section title="BSN and a Dutch bank account">
          <p>
            Register at your gemeente (municipality) after arrival to receive a BSN
            (citizen service number). Bring your passport, proof of enrolment and your rental
            contract. With a BSN you can open a Dutch IBAN, which most employers require for payroll.
          </p>
        </Section>
        <Section title="Health insurance">
          <p>
            Once you start working in the Netherlands you usually become liable for Dutch basic
            health insurance (basisverzekering), even as a student. Check this before your first
            shift — fines for being uninsured are avoidable.
          </p>
        </Section>
        <Section title="Pay, holiday allowance and payslips">
          <p>
            You are entitled to at least the statutory minimum wage for your age, 8% holiday
            allowance, and a written payslip for every period. Student jobs on this board typically
            pay € 14–24 per hour gross. Keep every payslip: you will need them for tax returns and
            for extending your residence permit.
          </p>
        </Section>
        <Section title="The orientation year (zoekjaar)">
          <p>
            Graduates of a Dutch higher-education programme can apply for the orientation-year
            permit within three years of graduating. It gives you 12 months of free access to the
            labour market — no TWV required, full-time allowed. Roles tagged
            “Graduate / Zoekjaar” here are aimed at exactly this group.
          </p>
        </Section>
      </Prose>
    </Layout>
  );
}
