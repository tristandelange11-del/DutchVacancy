import Layout from "@/components/Layout";
import { PageHero, Prose, TextSection } from "@/components/Static";
import { useLang } from "@/lib/i18n";
import { useSeo } from "@/lib/seo";

export default function Guide() {
  const { t } = useLang();
  useSeo({
    title: "Student Guide — Working in the Netherlands",
    description:
      "Work permits, the 16-hour rule, BSN, DigiD, payslips and Dutch employment basics explained in plain English for international students.",
    type: "article",
  });
  return (
    <Layout>
      <PageHero eyebrow={t("guide.eyebrow")} title={t("guide.title")} intro={t("guide.intro")} />
      <Prose testid="guide-page">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <TextSection key={n} titleKey={`guide.s${n}t`} bodyKey={`guide.s${n}b`} />
        ))}
      </Prose>
    </Layout>
  );
}
