export const appConfig = {
  name: "Kondo",
  description: "Gestão inteligente para condomínios",
  apiUrl: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  useMocks: import.meta.env.VITE_USE_MOCKS !== "false",
  paymentProvider: import.meta.env.VITE_PAYMENT_PROVIDER || "asaas",
};
