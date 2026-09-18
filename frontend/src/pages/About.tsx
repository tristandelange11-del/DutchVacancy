import Layout from "@/components/Layout";
import { PageHero, Prose, TextSection } from "@/components/Static";
import { useLang } from "@/lib/i18n";

export default function About() {
  const { t } = useLang();
  return (
    <Layout>
      <PageHero eyebrow={t("about.eyebrow")} title={t("about.title")} intro={t("about.intro")} />
      <Prose testid="about-page">
        <TextSection titleKey="about.s1t" bodyKey="about.s1b" />
        <TextSection titleKey="about.s2t" bodyKey="about.s2b" />
        <TextSection titleKey="about.s3t" bodyKey="about.s3b" />
      </Prose>
    </Layout>
  );
}
