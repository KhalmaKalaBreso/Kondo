import { useState } from "react";
import Layout from "../components/Layout.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ExpenseBar from "../components/ExpenseBar.jsx";
import QuickAction from "../components/QuickAction.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";
import ProgressRing from "../components/ProgressRing.jsx";
import DocumentList from "../components/DocumentList.jsx";
import DocumentUploader from "../components/DocumentUploader.jsx";
import { delinquency, expenses } from "../data/mockData.js";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: "/icons/chart.svg" },
  { id: "delinquency", label: "Inadimplência", icon: "/icons/warning.svg" },
  { id: "approvals", label: "Reservas", icon: "/icons/calendar.svg" },
  { id: "mural", label: "Mural de avisos", icon: "/icons/notice.svg" },
  { id: "expenses", label: "Gastos", icon: "/icons/wallet.svg" },
];

export default function StaffDashboard({ user, totals, notices, reservations, documents, onLogout, onAddNotice, onUpdateReservation, onAddDocument }) {
  const [activeTab, setActiveTab] = useState("dashboard");
  return <Layout user={user} activeTab={activeTab} tabs={tabs} onChangeTab={setActiveTab} onLogout={onLogout}>
    {activeTab === "dashboard" && <Overview totals={totals} notices={notices} reservations={reservations} documents={documents} onGoToTab={setActiveTab} />}
    {activeTab === "delinquency" && <DelinquencyPage />}
    {activeTab === "approvals" && <ReservationApprovals reservations={reservations} onUpdateReservation={onUpdateReservation} />}
    {activeTab === "mural" && <MuralPage notices={notices} onAddNotice={onAddNotice} />}
    {activeTab === "expenses" && <ExpensesPage documents={documents} onAddDocument={onAddDocument} />}
  </Layout>;
}

function Overview({ totals, notices, reservations, documents, onGoToTab }) {
  const totalDebt = delinquency.reduce((sum, item) => sum + item.debt, 0);
  const pending = reservations.filter((item) => item.status === "Pendente");
  const paidDocuments = documents.filter((item) => item.status === "Pago").length;
  return <div className="page-stack"><section className="welcome-panel admin-panel"><div><p className="eyebrow">Painel administrativo</p><h2>Gestão completa, visual e objetiva.</h2><span>Acompanhe inadimplência, reservas, avisos, documentos e gastos em um painel pronto para operação.</span><div className="welcome-actions"><button className="button button-primary" onClick={() => onGoToTab("approvals")}>Analisar reservas</button><button className="button button-soft" onClick={() => onGoToTab("expenses")}>Adicionar documento</button></div></div><ProgressRing value={74} label="Eficiência da gestão" description="Indicador visual baseado nas tarefas pendentes." /></section>
    <div className="stats-grid"><StatCard title="Inadimplência" value={totalDebt.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} subtitle={`${delinquency.length} moradores em atraso`} icon="/icons/warning.svg" trend="Atenção" /><StatCard title="Reservas pendentes" value={totals.pendingReservations} subtitle="Aguardando autorização" icon="/icons/calendar.svg" trend="Fila ativa" /><StatCard title="Documentos" value={documents.length} subtitle={`${paidDocuments} comprovados`} icon="/icons/notice.svg" trend="Transparência" /></div>
    <div className="quick-grid"><QuickAction icon="/icons/warning.svg" title="Cobranças" description="Visualizar moradores em atraso" onClick={() => onGoToTab("delinquency")} /><QuickAction icon="/icons/calendar.svg" title="Autorizações" description="Aprovar ou recusar reservas" onClick={() => onGoToTab("approvals")} /><QuickAction icon="/icons/wallet.svg" title="Gastos" description="Conferir documentos e despesas" onClick={() => onGoToTab("expenses")} /></div>
    <div className="two-columns"><div className="panel"><h3>Reservas aguardando análise</h3><div className="list">{pending.map((reservation) => <article className="list-item rich-item" key={reservation.id}><div><small>{reservation.space}</small><strong>{reservation.resident}</strong><span>Ap. {reservation.apartment} • {reservation.date} às {reservation.time}</span></div><StatusBadge status={reservation.status} /></article>)}</div></div><div className="panel"><h3>Atividades recentes</h3><ActivityFeed /></div></div>
  </div>;
}

function DelinquencyPage() { return <div className="page-stack"><SectionHeader eyebrow="Financeiro" title="Controle de inadimplência" description="Veja moradores em atraso, valores pendentes e dias de atraso." action={<button className="button button-primary">Exportar relatório</button>} /><div className="panel"><div className="table-wrapper"><table><thead><tr><th>Morador</th><th>Apartamento</th><th>Valor em aberto</th><th>Dias atrasado</th><th>Último pagamento</th><th>Risco</th><th>Status</th></tr></thead><tbody>{delinquency.map((item) => <tr key={item.apartment}><td>{item.resident}</td><td>{item.apartment}</td><td>{item.debt.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td>{item.daysLate} dias</td><td>{item.lastPayment}</td><td>{item.risk}</td><td><StatusBadge status="Atrasado" /></td></tr>)}</tbody></table></div></div></div>; }
function ReservationApprovals({ reservations, onUpdateReservation }) { return <div className="page-stack"><SectionHeader eyebrow="Áreas comuns" title="Autorização de reservas" description="Aprove ou recuse solicitações feitas pelos moradores." /><div className="panel"><div className="table-wrapper"><table><thead><tr><th>Morador</th><th>Ap.</th><th>Espaço</th><th>Data</th><th>Horário</th><th>Status</th><th>Ações</th></tr></thead><tbody>{reservations.map((reservation) => <tr key={reservation.id}><td>{reservation.resident}</td><td>{reservation.apartment}</td><td>{reservation.space}</td><td>{reservation.date}</td><td>{reservation.time}</td><td><StatusBadge status={reservation.status} /></td><td><div className="table-actions"><button className="button button-small" onClick={() => onUpdateReservation(reservation.id, "Aprovada")}>Aprovar</button><button className="button button-small button-danger" onClick={() => onUpdateReservation(reservation.id, "Recusada")}>Recusar</button></div></td></tr>)}</tbody></table></div></div></div>; }

function MuralPage({ notices, onAddNotice }) { const [form, setForm] = useState({ title: "", category: "Comunicado", description: "", priority: "Normal" }); const [error, setError] = useState(""); function submit(event) { event.preventDefault(); if (!form.title.trim() || !form.description.trim()) { setError("Preencha título e descrição do aviso."); return; } setError(""); onAddNotice(form); setForm({ title: "", category: "Comunicado", description: "", priority: "Normal" }); }
  return <div className="page-stack"><SectionHeader eyebrow="Comunicação" title="Mural de avisos" description="Publique comunicados de manutenção, assembleias e informações gerais." /><div className="two-columns"><div className="panel"><h3>Novo aviso</h3><form className="form" onSubmit={submit}><label>Título<input type="text" placeholder="Ex: Manutenção na piscina" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label>Categoria<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option>Comunicado</option><option>Manutenção</option><option>Assembleia</option><option>Transparência</option></select></label><label>Prioridade<select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>Normal</option><option>Média</option><option>Alta</option></select></label><label>Descrição<textarea rows="5" placeholder="Digite o conteúdo do aviso" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary" type="submit">Publicar aviso</button></form></div><div className="panel"><h3>Avisos publicados</h3><div className="list">{notices.map((notice) => <article className="list-item" key={notice.id}><div><strong>{notice.title}</strong><span>{notice.category}</span></div><div className="stack-right"><small>{notice.date}</small><StatusBadge status={notice.priority} /></div></article>)}</div></div></div></div>; }

function ExpensesPage({ documents, onAddDocument }) {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const documented = documents.reduce((sum, doc) => sum + Number(doc.amount || 0), 0);
  return <div className="page-stack"><SectionHeader eyebrow="Gestão financeira" title="Dashboard de gastos do condomínio" description="Acompanhe despesas, boletos e comprovantes fictícios vinculados à transparência." action={<DocumentUploader onAddDocument={onAddDocument} />} />
    <div className="stats-grid"><StatCard title="Total mensal" value={total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} subtitle="Despesas do período" icon="/icons/wallet.svg" /><StatCard title="Documentos" value={documents.length} subtitle="Boletos e comprovantes" icon="/icons/notice.svg" /><StatCard title="Valor documentado" value={documented.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} subtitle="Exemplos fictícios" icon="/icons/shield.svg" /></div>
    <div className="panel"><h3>Gastos por categoria</h3><div className="expense-list">{expenses.map((item) => <ExpenseBar item={item} key={item.category} />)}</div></div>
    <div className="panel"><div className="panel-title-row"><div><h3>Documentos de transparência</h3><p>Use o botão “Adicionar documento” para abrir a pasta do sistema e anexar um arquivo ao painel.</p></div><DocumentUploader onAddDocument={onAddDocument} buttonLabel="Adicionar documento" /></div><DocumentList documents={documents} /></div>
  </div>;
}
