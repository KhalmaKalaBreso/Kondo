import { useEffect, useMemo, useState } from "react";
import { paymentService } from "../services/paymentService.js";

const methodLabels = {
  pix: "Pix",
  boleto: "Boleto",
  card: "Cartão",
};

export default function PaymentCheckoutModal({ payment, method, user, onClose, onPaid }) {
  const [intent, setIntent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState("");
  const [card, setCard] = useState({
    number: "4111 1111 1111 1111",
    name: user?.name || "Morador Kondo",
    expiry: "12/30",
    cvv: "123",
    installments: "1",
  });

  const title = useMemo(() => methodLabels[method] || "Pagamento", [method]);

  useEffect(() => {
    let ignore = false;

    async function loadIntent() {
      try {
        setLoading(true);
        setError("");
        const response = await paymentService.createIntent({ payment, method, user });
        if (!ignore) setIntent(response);
      } catch (err) {
        if (!ignore) setError(err.message || "Não foi possível criar o pagamento.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadIntent();
    return () => {
      ignore = true;
    };
  }, [payment, method, user]);

  async function copyText(value, label) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    } catch {
      setCopied("Não foi possível copiar automaticamente.");
      setTimeout(() => setCopied(""), 2200);
    }
  }

  async function simulatePaid() {
    setProcessing(true);
    await paymentService.confirmMockPayment();
    setProcessing(false);
    onPaid(payment.id, method, intent);
  }

  function updateCard(field, value) {
    setCard((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <section className="payment-modal">
        <header className="payment-modal-header">
          <div>
            <p className="eyebrow">Checkout de teste</p>
            <h2>Pagamento via {title}</h2>
            <span>
              Taxa {payment.month} • {payment.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
            </span>
          </div>

          <button className="modal-close" type="button" onClick={onClose} aria-label="Fechar checkout">
            ×
          </button>
        </header>

        {loading && (
          <div className="payment-loading">
            <span className="loader-dot" />
            <strong>Gerando pagamento de teste...</strong>
            <p>Preparando dados do {title} no sandbox.</p>
          </div>
        )}

        {!loading && error && (
          <div className="payment-error">
            <strong>Erro no pagamento</strong>
            <p>{error}</p>
            <button className="button button-outline" type="button" onClick={onClose}>Fechar</button>
          </div>
        )}

        {!loading && !error && intent && (
          <>
            <div className="payment-provider-card">
              <span>Provider</span>
              <strong>{intent.providerName}</strong>
              <small>ID: {intent.transactionId}</small>
            </div>

            {method === "pix" && (
              <div className="payment-grid pix-grid">
                <div className="qr-card">
                  <img src={intent.pixQrCode} alt="QR Code Pix de teste" />
                </div>

                <div className="payment-instructions">
                  <h3>Pix copia e cola</h3>
                  <p>{intent.instructions}</p>
                  <textarea readOnly value={intent.pixCopyPaste} />
                  <button className="button button-outline" type="button" onClick={() => copyText(intent.pixCopyPaste, "Código Pix copiado")}>Copiar código Pix</button>
                  {copied && <small className="copy-feedback">{copied}</small>}
                </div>
              </div>
            )}

            {method === "boleto" && (
              <div className="payment-instructions boleto-box">
                <h3>Linha digitável</h3>
                <p>{intent.instructions}</p>
                <div className="barcode-line">{intent.boletoLine}</div>
                <div className="payment-actions-inline">
                  <button className="button button-outline" type="button" onClick={() => copyText(intent.boletoLine, "Linha digitável copiada")}>Copiar linha</button>
                  <a className="button button-primary" href={intent.boletoUrl} target="_blank" rel="noreferrer">Abrir boleto</a>
                </div>
                {copied && <small className="copy-feedback">{copied}</small>}
              </div>
            )}

            {method === "card" && (
              <div className="card-test-grid">
                <div className="fake-credit-card">
                  <span>Kondo Card Test</span>
                  <strong>{card.number}</strong>
                  <small>{card.name}</small>
                </div>

                <form className="form card-form" onSubmit={(event) => { event.preventDefault(); simulatePaid(); }}>
                  <label>
                    Número do cartão
                    <input value={card.number} onChange={(e) => updateCard("number", e.target.value)} />
                  </label>
                  <label>
                    Nome impresso
                    <input value={card.name} onChange={(e) => updateCard("name", e.target.value)} />
                  </label>
                  <div className="form-grid-two">
                    <label>
                      Validade
                      <input value={card.expiry} onChange={(e) => updateCard("expiry", e.target.value)} />
                    </label>
                    <label>
                      CVV
                      <input value={card.cvv} onChange={(e) => updateCard("cvv", e.target.value)} />
                    </label>
                  </div>
                  <label>
                    Parcelas
                    <select value={card.installments} onChange={(e) => updateCard("installments", e.target.value)}>
                      <option value="1">1x sem juros</option>
                      <option value="2">2x sem juros</option>
                      <option value="3">3x sem juros</option>
                    </select>
                  </label>
                  <button className="button button-primary" type="submit" disabled={processing}>
                    {processing ? "Processando..." : "Simular pagamento aprovado"}
                  </button>
                </form>
              </div>
            )}

            {method !== "card" && (
              <footer className="payment-modal-footer">
                <div>
                  <strong>Expira em: {intent.expiresAt}</strong>
                  <span>Use o botão abaixo para simular a confirmação do webhook.</span>
                </div>
                <button className="button button-primary" type="button" onClick={simulatePaid} disabled={processing}>
                  {processing ? "Confirmando..." : "Simular pagamento recebido"}
                </button>
              </footer>
            )}
          </>
        )}
      </section>
    </div>
  );
}
