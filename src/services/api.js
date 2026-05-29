import { appConfig } from "../config/appConfig.js";

async function request(path, options = {}) {
  const response = await fetch(`${appConfig.apiUrl}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "Erro ao comunicar com a API");
  }

  return response.json();
}

export const api = {
  login: (payload) => request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  register: (payload) => request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  getDashboard: () => request("/dashboard"),
  getPayments: () => request("/payments"),
  createPayment: (payload) => request("/payments", { method: "POST", body: JSON.stringify(payload) }),
  createPaymentIntent: (payload) => request("/payments/create-intent", { method: "POST", body: JSON.stringify(payload) }),
  confirmPayment: (id, payload) => request(`/payments/${id}/confirm`, { method: "POST", body: JSON.stringify(payload) }),
  getReservations: () => request("/reservations"),
  createReservation: (payload) => request("/reservations", { method: "POST", body: JSON.stringify(payload) }),
  updateReservation: (id, payload) => request(`/reservations/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  getNotices: () => request("/notices"),
  createNotice: (payload) => request("/notices", { method: "POST", body: JSON.stringify(payload) }),
  getExpenses: () => request("/expenses"),
  getDelinquency: () => request("/delinquency"),
};
