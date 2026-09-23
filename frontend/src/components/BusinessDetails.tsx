import business from "@/config/business.json";
import { useLang } from "@/lib/i18n";
import { Section } from "@/components/Static";

export const businessReady = Object.values(business).every((value) => value.trim());

export default function BusinessDetails() {
  const { lang } = useLang();
  const nl = lang === "nl";
  if (!businessReady) return (
    <p role="status" className="rounded-xl border border-border p-4">
      {nl ? "Concept. Deze pagina wordt vóór de lancering aangevuld met de bedrijfsgegevens."
          : "Draft. Company details will be added before launch."}
    </p>
  );
  return <Section title={nl ? "Aanbieder en contact" : "Operator and contact"}>
    <p>{business.legal_name}</p>
    <p className="whitespace-pre-line">{business.address}</p>
    <p>KvK: {business.kvk_number}</p>
    <a className="underline" href={`mailto:${business.contact_email}`}>{business.contact_email}</a>
  </Section>;
}
