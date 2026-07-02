"use client";

import { useState } from "react";
import { MercadoPagoCheckout } from "@/components/payments/mercadopago-checkout";

interface PaymentCheckoutPanelProps {
  paymentId: string;
  showRefreshButton?: boolean;
  onSuccess?: () => void;
}

export function PaymentCheckoutPanel({
  paymentId,
  showRefreshButton = true,
  onSuccess,
}: PaymentCheckoutPanelProps) {
  const [pendingMessage, setPendingMessage] = useState("");
  const [pixData, setPixData] = useState<{
    qrCode?: string | null;
    qrCodeBase64?: string | null;
    ticketUrl?: string | null;
  } | null>(null);

  return (
    <div className="space-y-4">
      <MercadoPagoCheckout
        paymentId={paymentId}
        showRefreshButton={showRefreshButton}
        onApproved={() => {
          setPendingMessage("");
          setPixData(null);
          onSuccess?.();
        }}
        onPending={({ pix }) => {
          setPixData(pix ?? null);
          setPendingMessage(
            "Pagamento iniciado. Assim que o Mercado Pago confirmar, sua situação será atualizada automaticamente."
          );
        }}
      />

      {pendingMessage && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 p-4 text-sm text-primary">
          {pendingMessage}
        </div>
      )}

      {pixData?.qrCodeBase64 && (
        <div className="rounded-lg border border-white/10 bg-zinc-900 p-4 text-sm">
          <p className="mb-3 font-medium text-white">PIX gerado</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`data:image/png;base64,${pixData.qrCodeBase64}`}
            alt="QR Code PIX"
            className="mx-auto h-48 w-48 rounded-lg bg-white p-2"
          />
          {pixData.qrCode && (
            <p className="mt-3 break-all font-mono text-xs text-muted">{pixData.qrCode}</p>
          )}
        </div>
      )}

      {pixData?.ticketUrl && (
        <a
          href={pixData.ticketUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm text-primary hover:underline"
        >
          Abrir boleto
        </a>
      )}
    </div>
  );
}
