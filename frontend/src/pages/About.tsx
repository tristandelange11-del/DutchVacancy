import Layout from "@/components/Layout";
import BusinessDetails from "@/components/BusinessDetails";
import { PageHero, Prose, TextSection } from "@/components/Static";
import { useLang } from "@/lib/i18n";
import { useSeo } from "@/lib/seo";

export default function About() {
  const { t } = useLang();
  useSeo({
    title: "About DutchVacancy",
    description:
      "Why DutchVacancy exists: a job board for international students in the Netherlands where every vacancy states its language requirement and closing date.",
  });
  return (
    <Layout>
      <PageHero eyebrow={t("about.eyebrow")} title={t("about.title")} intro={t("about.intro")} />
      <Prose testid="about-page">
        <TextSection titleKey="about.s1t" bodyKey="about.s1b" />
        <TextSection titleKey="about.s2t" bodyKey="about.s2b" />
        <TextSection titleKey="about.s3t" bodyKey="about.s3b" />
        <BusinessDetails />
      </Prose>
    </Layout>
  );
}
