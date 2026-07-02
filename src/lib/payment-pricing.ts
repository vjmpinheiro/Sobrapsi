import {
  ANNUAL_FEE_CARD_AMOUNT,
  ANNUAL_FEE_CASH_AMOUNT,
  ANNUAL_FEE_INSTALLMENTS,
  APPLICATION_FEE_CARD_AMOUNT,
  APPLICATION_FEE_CASH_AMOUNT,
} from "@/lib/constants";

export type CheckoutPricingMethod = "card" | "pix_boleto";

export interface CheckoutPricingOption {
  method: CheckoutPricingMethod;
  label: string;
  amount: number;
  installments?: number;
  installmentAmount?: number;
  description: string;
}

export function getCheckoutPricingOptions(paymentType: string): CheckoutPricingOption[] {
  if (paymentType === "annual_fee") {
    const installmentValue = ANNUAL_FEE_CARD_AMOUNT / ANNUAL_FEE_INSTALLMENTS;
    return [
      {
        method: "card",
        label: "Cartão de crédito",
        amount: ANNUAL_FEE_CARD_AMOUNT,
        installments: ANNUAL_FEE_INSTALLMENTS,
        installmentAmount: installmentValue,
        description: `R$ ${ANNUAL_FEE_CARD_AMOUNT.toFixed(0)} em até ${ANNUAL_FEE_INSTALLMENTS}x R$ ${installmentValue.toFixed(0)}`,
      },
      {
        method: "pix_boleto",
        label: "PIX ou boleto",
        amount: ANNUAL_FEE_CASH_AMOUNT,
        description: `R$ ${ANNUAL_FEE_CASH_AMOUNT.toFixed(2)} à vista`,
      },
    ];
  }

  const installmentValue = APPLICATION_FEE_CARD_AMOUNT / ANNUAL_FEE_INSTALLMENTS;

  return [
    {
      method: "card",
      label: "Cartão de crédito",
      amount: APPLICATION_FEE_CARD_AMOUNT,
      installments: ANNUAL_FEE_INSTALLMENTS,
      installmentAmount: installmentValue,
      description: `R$ ${APPLICATION_FEE_CARD_AMOUNT.toFixed(0)} em até ${ANNUAL_FEE_INSTALLMENTS}x R$ ${installmentValue.toFixed(0)}`,
    },
    {
      method: "pix_boleto",
      label: "PIX ou boleto",
      amount: APPLICATION_FEE_CASH_AMOUNT,
      description: `R$ ${APPLICATION_FEE_CASH_AMOUNT.toFixed(2)} à vista`,
    },
  ];
}

export function getCheckoutAmount(paymentType: string, method: CheckoutPricingMethod) {
  const option = getCheckoutPricingOptions(paymentType).find((item) => item.method === method);
  if (!option) {
    throw new Error("Forma de pagamento inválida");
  }
  return option;
}

export function getPaymentDescription(paymentType: string) {
  if (paymentType === "annual_fee") return "Anuidade SOBRAPSI";
  if (paymentType === "application_fee") return "Taxa de candidatura SOBRAPSI";
  return "Pagamento SOBRAPSI";
}
