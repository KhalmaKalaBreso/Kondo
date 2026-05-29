import StatusBadge from "./StatusBadge.jsx";

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function DocumentList({ documents, compact = false }) {
  if (!documents?.length) {
    return (
      <div className="empty-documents">
        <img src="/icons/notice.svg" alt="" aria-hidden="true" />
        <strong>Nenhum documento publicado</strong>
        <span>Boletos, comprovantes e anexos de transparência aparecerão aqui.</span>
      </div>
    );
  }

  return (
    <div className={compact ? "document-list compact" : "document-list"}>
      {documents.map((document) => (
        <article className="document-card" key={document.id}>
          <div className="document-icon">
            <img src={document.type === "Boleto" ? "/icons/boleto.svg" : document.type === "Comprovante" ? "/icons/shield.svg" : "/icons/notice.svg"} alt="" aria-hidden="true" />
          </div>

          <div className="document-content">
            <div className="document-topline">
              <span>{document.type}</span>
              <StatusBadge status={document.status} />
            </div>
            <h3>{document.title}</h3>
            <p>{document.description}</p>

            <div className="document-meta-grid">
              <span><strong>Categoria</strong>{document.category}</span>
              <span><strong>Competência</strong>{document.competence}</span>
              <span><strong>Fornecedor</strong>{document.supplier}</span>
              <span><strong>Valor</strong>{formatCurrency(document.amount)}</span>
            </div>
          </div>

          <div className="document-actions">
            <small>{document.fileName}</small>
            {document.fileUrl ? (
              <a className="button button-small button-outline" href={document.fileUrl} target="_blank" rel="noreferrer">
                Abrir documento
              </a>
            ) : (
              <button className="button button-small" type="button" disabled>
                Arquivo local
              </button>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}
