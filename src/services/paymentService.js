import { api } from "./api.js";
import { appConfig } from "../config/appConfig.js";

const providerLabel = {
  asaas: "Asaas Sandbox",
  mercadoPago: "Mercado Pago Sandbox",
  pagarme: "Pagar.me Sandbox",
};

function wait(ms = 650) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function onlyNumbers(value) {
  return String(value || "").replace(/\D/g, "");
}

function buildPixCopyPaste(payment, user) {
  const value = Number(payment.value || 0).toFixed(2).replace(".", "");
  const apartment = onlyNumbers(user?.apartment || "204") || "204";

  return [
    "000201",
    "26360014BR.GOV.BCB.PIX0114+5579999999999",
    "52040000",
    "5303986",
    `54${String(value.length).padStart(2, "0")}${value}`,
    "5802BR",
    "5911KONDO TESTE",
    "6007ARACAJU",
    `62140510AP${apartment}`,
    "6304TEST",
  ].join("");
}

function buildFakeQrSvg(text) {
  const seed = text.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const cells = 13;
  const size = 182;
  const cell = size / cells;
  const rects = [];

  for (let y = 0; y < cells; y += 1) {
    for (let x = 0; x < cells; x += 1) {
      const isFinder =
        (x < 4 && y < 4) ||
        (x > 8 && y < 4) ||
        (x < 4 && y > 8);
      const filled = isFinder || ((x * 11 + y * 7 + seed) % 5 < 2);
      if (filled) {
        rects.push(
          `<rect x="${Math.round(x * cell)}" y="${Math.round(y * cell)}" width="${Math.ceil(cell - 2)}" height="${Math.ceil(cell - 2)}" rx="3" fill="#073b6d" />`
        );
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><rect width="${size}" height="${size}" rx="18" fill="#fff"/>${rects.join("")}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function buildBoletoLine(payment, user) {
  const id = String(payment.id || 1).padStart(3, "0");
  const value = String(Math.round(Number(payment.value || 0) * 100)).padStart(10, "0");
  const apartment = onlyNumbers(user?.apartment || "204").padStart(4, "0");

  return `34191.79001 01043.${id}000 ${apartment}0.910007 8 0000${value}`;
}

async function createMockPaymentIntent({ payment, method, user }) {
  await wait();

  const provider = appConfig.paymentProvider || "asaas";
  const transactionId = `kondo_${method}_${payment.id}_${Date.now()}`;
  const base = {
    provider,
    providerName: providerLabel[provider] || "Sandbox de Pagamento",
    transactionId,
    status: "pending",
    amount: payment.value,
    amountFormatted: money(payment.value),
    expiresAt: new Date(Date.now() + 30 * 60 * 1000).toLocaleString("pt-BR"),
    customer: {
      name: user?.name || "Morador Kondo",
      email: user?.email || "morador@kondo.local",
      apartment: user?.apartment || "204B",
    },
  };

  if (method === "pix") {
    const pixCopyPaste = buildPixCopyPaste(payment, user);
    return {
      ...base,
      method: "pix",
      pixCopyPaste,
      pixQrCode: buildFakeQrSvg(pixCopyPaste),
      instructions: "Use o QR Code ou copie o código Pix. Este pagamento é simulado para teste visual.",
    };
  }

  if (method === "boleto") {
    return {
      ...base,
      method: "boleto",
      boletoLine: buildBoletoLine(payment, user),
      boletoUrl: "https://www.asaas.com/b/pdf/demo-boleto-kondo",
      instructions: "Copie a linha digitável ou abra o boleto demonstrativo. Este boleto é apenas para teste.",
    };
  }

  return {
    ...base,
    method: "card",
    checkoutUrl: "https://checkout.sandbox.kondo.local/card",
    instructions: "Use o cartão de teste 4111 1111 1111 1111 para simular aprovação no front-end.",
  };
}

export const paymentService = {
  createIntent: async ({ payment, method, user }) => {
    if (appConfig.useMocks) {
      return createMockPaymentIntent({ payment, method, user });
    }

    return api.createPaymentIntent({
      paymentId: payment.id,
      method,
      provider: appConfig.paymentProvider,
      amount: payment.value,
      description: `Taxa de condomínio ${payment.month}`,
      customer: {
        name: user?.name,
        email: user?.email,
        apartment: user?.apartment,
      },
    });
  },

  confirmMockPayment: async () => {
    await wait(500);
    return {
      status: "paid",
      paidAt: new Date().toISOString(),
    };
  },
};
