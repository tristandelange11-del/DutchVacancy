import Layout from "@/components/Layout";
import { PageHero, Prose, TextSection } from "@/components/Static";
import { useLang } from "@/lib/i18n";

export default function Terms() {
  const { t } = useLang();
  return (
    <Layout>
      <PageHero eyebrow={t("terms.eyebrow")} title={t("terms.title")} intro={t("terms.intro")} />
      <Prose testid="terms-page">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <TextSection key={n} titleKey={`terms.s${n}t`} bodyKey={`terms.s${n}b`} />
        ))}
      </Prose>
    </Layout>
  );
}
