import Layout from "@/components/Layout";
import { PageHero, Prose, Section } from "@/components/Static";

export default function Privacy() {
  return (
    <Layout>
      <PageHero
        eyebrow="Privacy policy"
        title="How DutchVacancy handles your data"
        intro="Last updated: 1 January 2026. We process personal data under the EU GDPR and Dutch implementation act (UAVG)."
      />
      <Prose testid="privacy-page">
        <Section title="What we collect">
          <p>
            <strong>Students:</strong> name, email address, password (hashed), university, study
            programme, city, English level, phone number, CV link, introduction text, saved jobs and
            applications.
          </p>
          <p>
            <strong>Employers:</strong> name, email address, password (hashed), company name, city,
            industry, website and the vacancies you publish.
          </p>
          <p>
            <strong>Everyone:</strong> a session cookie that keeps you logged in, and any message you
            send through the contact form.
          </p>
        </Section>
        <Section title="Why we process it">
          <p>
            To operate your account, show you relevant vacancies, deliver your applications to the
            employer you chose, and answer your support messages. When you apply to a vacancy, the
            employer receives your name, email, university, CV link and motivation text — that is the
            purpose of applying.
          </p>
        </Section>
        <Section title="Cookies">
          <p>
            We set one strictly necessary, httpOnly session cookie. We do not use advertising or
            cross-site tracking cookies.
          </p>
        </Section>
        <Section title="Retention">
          <p>
            Account data is kept while your account exists. Applications are kept for 24 months so
            you and the employer keep a record, then deleted. You can request deletion at any time.
          </p>
        </Section>
        <Section title="Your rights">
          <p>
            You have the right to access, correct, export, restrict or delete your data, and to
            object to processing. Email hello@dutchvacancy.nl and we will respond within one month.
            You may also complain to the Autoriteit Persoonsgegevens, the Dutch data protection
            authority.
          </p>
        </Section>
      </Prose>
    </Layout>
  );
}
