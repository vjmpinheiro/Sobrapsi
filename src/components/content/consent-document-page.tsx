import { PageHero, Section } from "@/components/layout/sections";
import { ConsentDocumentBody } from "@/components/content/consent-document-body";
import type { ConsentDocumentId } from "@/lib/consent-documents";
import { CONSENT_DOCUMENTS } from "@/lib/consent-documents";

const HERO_EYEBROWS: Record<ConsentDocumentId, string> = {
  privacy_policy: "LGPD",
  terms_of_use: "Legal",
  regulation: "Regulamento",
  ethics_code: "Ética",
  veracity: "Declaração",
  not_automatic: "Candidatura",
  not_substitute: "Institucional",
};

export function ConsentDocumentPage({ documentId }: { documentId: ConsentDocumentId }) {
  const document = CONSENT_DOCUMENTS[documentId];

  return (
    <>
      <PageHero
        eyebrow={HERO_EYEBROWS[documentId]}
        title={document.title}
        subtitle={document.intro}
        backgroundText={document.title.split(" ")[0].toUpperCase()}
      />
      <Section>
        <ConsentDocumentBody document={document} />
      </Section>
    </>
  );
}
