import Layout from "@/components/Layout";
import LogoMark from "@/components/LogoMark";
import { useLang } from "@/lib/i18n";

/** Shown while a page's code loads: header and footer stay, the mark types in between. */
export function PageLoading() {
  const { t } = useLang();
  return (
    <Layout>
      <div className="grid min-h-[60vh] place-items-center" role="status" data-testid="page-loading">
        <LogoMark size={48} mode="load" gap="var(--background)" />
        <span className="sr-only">{t("common.loading")}</span>
      </div>
    </Layout>
  );
}
