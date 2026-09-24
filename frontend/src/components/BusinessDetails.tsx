import business from "@/config/business.json";
import { useLang } from "@/lib/i18n";
import { Section } from "@/components/Static";

export const businessReady = Object.values(business).every((value) => value.trim());

export default function BusinessDetails() {
  const { lang } = useLang();
  const nl = lang === "nl";
  return <Section title={nl ? "Aanbieder en contact" : "Operator and contact"}>
    {!businessReady && <p role="status" className="rounded-xl border border-border p-4">
      {nl ? "Concept. De bedrijfsgegevens zijn nog niet compleet."
          : "Draft. Company details are not yet complete."}
    </p>}
    <p>{business.legal_name}</p>
    <p className="whitespace-pre-line">{business.address || (nl ? "Zakelijk correspondentieadres: nog niet ingevuld." : "Business correspondence address: not yet provided.")}</p>
    <p>{business.kvk_number ? `KvK: ${business.kvk_number}` : (nl ? "Nog geen KvK-inschrijving." : "Not yet registered with the Dutch Chamber of Commerce (KvK).")}</p>
    {business.contact_email
      ? <a className="underline" href={`mailto:${business.contact_email}`}>{business.contact_email}</a>
      : <p>{nl ? "Openbaar e-mailadres: nog niet ingevuld." : "Public email address: not yet provided."}</p>}
  </Section>;
}
