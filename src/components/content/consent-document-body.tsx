import type { ConsentDocument, ConsentDocumentId } from "@/lib/consent-documents";
import { CONSENT_DOCUMENTS } from "@/lib/consent-documents";

export function ConsentDocumentBody({
  documentId,
  document: doc,
}: {
  documentId?: ConsentDocumentId;
  document?: ConsentDocument;
}) {
  const content = doc ?? (documentId ? CONSENT_DOCUMENTS[documentId] : null);
  if (!content) return null;

  return (
    <div className="space-y-6 text-sm leading-relaxed text-muted">
      {content.intro && <p>{content.intro}</p>}
      {content.sections.map((section) => (
        <div key={section.title}>
          <h3 className="mb-2 text-base font-semibold text-white">{section.title}</h3>
          <p>{section.body}</p>
        </div>
      ))}
      {content.footer && (
        <p className="border-t border-white/10 pt-4 text-primary">{content.footer}</p>
      )}
    </div>
  );
}
