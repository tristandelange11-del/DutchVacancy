import Layout from "@/components/Layout";
import { PageHero, Prose, Section } from "@/components/Static";

export default function About() {
  return (
    <Layout>
      <PageHero
        eyebrow="About us"
        title="Built by international students, for international students"
        intro="DutchVacancy started as a spreadsheet passed between friends in Amsterdam who were tired of applying to jobs that turned out to require fluent Dutch."
      />
      <Prose testid="about-page">
        <Section title="Why we exist">
          <p>
            More than 120,000 international students study in the Netherlands, and most of them want
            to work alongside their degree. The obstacle is rarely skill — it is information. Dutch
            job boards rarely say whether a team actually works in English, whether a company will
            arrange a TWV work permit, or whether 16 contract hours are possible.
          </p>
          <p>
            We only list vacancies where that information is explicit. Every role on DutchVacancy
            carries its English requirement, its weekly hours, its hourly range and its permit
            support, stated by the employer at publication.
          </p>
        </Section>
        <Section title="What we do for employers">
          <p>
            Dutch employers tell us the same thing: they want international talent but their postings
            get lost on general boards. A DutchVacancy listing reaches students who are already in
            the Netherlands, already enrolled, and already able to start this semester.
          </p>
        </Section>
        <Section title="What we are not">
          <p>
            We are not a recruitment agency and we never charge students. We are not affiliated with
            the IND, UWV or any Dutch government body — the guidance on this site is written in plain
            English to help you ask the right questions, not to replace official advice.
          </p>
        </Section>
      </Prose>
    </Layout>
  );
}
