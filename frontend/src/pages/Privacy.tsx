import Layout from "@/components/Layout";
import { PageHero, Prose, TextSection } from "@/components/Static";
import { useLang } from "@/lib/i18n";
import { useSeo } from "@/lib/seo";

export default function Privacy() {
  const { t } = useLang();
  useSeo({
    title: "Privacy Policy",
    description:
      "How DutchVacancy collects, stores and shares your data, including CV files and application details shared with employers.",
  });
  return (
    <Layout>
      <PageHero eyebrow={t("privacy.eyebrow")} title={t("privacy.title")} intro={t("privacy.intro")} />
      <Prose testid="privacy-page">
        {[1, 2, 3, 4, 5].map((n) => (
          <TextSection key={n} titleKey={`privacy.s${n}t`} bodyKey={`privacy.s${n}b`} />
        ))}
      </Prose>
    </Layout>
  );
}
