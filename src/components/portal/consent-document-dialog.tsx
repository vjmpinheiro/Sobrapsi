"use client";

import Link from "next/link";
import { ConsentDocumentBody } from "@/components/content/consent-document-body";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ConsentDocumentId } from "@/lib/consent-documents";
import { CONSENT_DOCUMENTS } from "@/lib/consent-documents";

export function ConsentDocumentDialog({
  documentId,
  open,
  onOpenChange,
}: {
  documentId: ConsentDocumentId | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const document = documentId ? CONSENT_DOCUMENTS[documentId] : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {document && (
          <>
            <DialogHeader>
              <DialogTitle>{document.title}</DialogTitle>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto pr-1">
              <ConsentDocumentBody document={document} />
            </div>
            <div className="border-t border-white/10 pt-4">
              <Link
                href={document.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-primary hover:underline"
              >
                Abrir página completa
              </Link>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
