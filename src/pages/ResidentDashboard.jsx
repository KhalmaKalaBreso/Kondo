import { useMemo, useState } from "react";
import Layout from "../components/Layout.jsx";
import SectionHeader from "../components/SectionHeader.jsx";
import StatCard from "../components/StatCard.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import ExpenseBar from "../components/ExpenseBar.jsx";
import QuickAction from "../components/QuickAction.jsx";
import ActivityFeed from "../components/ActivityFeed.jsx";
import ProgressRing from "../components/ProgressRing.jsx";
import EmptyState from "../components/EmptyState.jsx";
import PaymentCheckoutModal from "../components/PaymentCheckoutModal.jsx";
import DocumentList from "../components/DocumentList.jsx";
import { expenses, payments, spaces } from "../data/mockData.js";

const tabs = [
  { id: "overview", label: "Resumo", icon: "/icons/home.svg" },
  { id: "payments", label: "Pagamentos", icon: "/icons/payment.svg" },
  { id: "reservations", label: "Reservas", icon: "/icons/calendar.svg" },
  { id: "notices", label: "Avisos", icon: "/icons/notice.svg" },
  { id: "transparency", label: "Transparência", icon: "/icons/chart.svg" },
];

export default function ResidentDashboard({ user, totals, notices, reservations, documents, onLogout, onAddReservation }) {
  const [activeTab, setActiveTab] = useState("overview");
  const myReservations = useMemo(() => reservations.filter((item) => item.resident === user.name || item.apartment === user.apartment), [reservations, user]);

  return <Layout user={user} activeTab={activeTab} tabs={tabs} onChangeTab={setActiveTab} onLogout={onLogout}>
    {activeTab === "overview" && <Overview notices={notices} reservations={myReservations} totals={totals} onGoToTab={setActiveTab} />}
    {activeTab === "payments" && <PaymentsPage user={user} />}
    {activeTab === "reservations" && <ReservationsPage reservations={myReservations} onAddReservation={onAddReservation} />}
    {activeTab === "notices" && <NoticesPage notices={notices} />}
    {activeTab === "transparency" && <TransparencyPage documents={documents} />}
  </Layout>;
}

function Overview({ notices, reservations, totals, onGoToTab }) {
  const openPayment = payments.find((item) => item.status === "Em aberto");
  return <div className="page-stack">
    <section className="welcome-panel"><div><p className="eyebrow">Painel do morador</p><h2>Seu condomínio na palma da mão.</h2><span>Acompanhe pagamentos, reservas e comunicados com uma experiência simples e profissional.</span><div className="welcome-actions"><button className="button button-primary" onClick={() => onGoToTab("payments")}>Pagar taxa</button><button className="button button-soft" onClick={() => onGoToTab("reservations")}>Reservar espaço</button></div></div><ProgressRing value={86} label="Status da unidade" description="Pagamentos e solicitações em boa situação." /></section>
    <div className="stats-grid"><StatCard title="Taxa atual" value={`R$ ${openPayment.value.toFixed(2).replace(".", ",")}`} subtitle={`Vencimento: ${openPayment.dueDate}`} icon="/icons/payment.svg" trend="Pix liberado" /><StatCard title="Minhas reservas" value={reservations.length} subtitle="Solicitações feitas por você" icon="/icons/calendar.svg" trend="Atualizado" /><StatCard title="Comunicados" value={totals.notices} subtitle="Avisos publicados" icon="/icons/notice.svg" trend="Mural ativo" /></div>
    <div className="quick-grid"><QuickAction icon="/icons/pix.svg" title="Pagar com Pix" description="Gere o código da taxa atual" onClick={() => onGoToTab("payments")} /><QuickAction icon="/icons/calendar.svg" title="Nova reserva" description="Churrasqueira, salão ou quadra" onClick={() => onGoToTab("reservations")} /><QuickAction icon="/icons/chart.svg" title="Ver transparência" description="Entenda os gastos" onClick={() => onGoToTab("transparency")} /></div>
    <div className="two-columns"><div className="panel"><h3>Últimos avisos</h3><div className="list">{notices.slice(0, 3).map((notice) => <article className="list-item rich-item" key={notice.id}><div><small>{notice.category}</small><strong>{notice.title}</strong><span>{notice.description}</span></div><em>{notice.date}</em></article>)}</div></div><div className="panel"><h3>Atividades recentes</h3><ActivityFeed /></div></div>
  </div>;
}

function PaymentsPage({ user }) {
  const [paymentList, setPaymentList] = useState(payments);
  const [checkout, setCheckout] = useState(null);
  const openPayment = paymentList.find((item) => item.status === "Em aberto") || paymentList[0];

  function openCheckout(method, payment = openPayment) { if (!payment || payment.status === "Pago") return; setCheckout({ payment, method }); }
  function finishPayment(paymentId, method, intent) { setPaymentList((current) => current.map((item) => item.id === paymentId ? { ...item, status: "Pago", method: method === "pix" ? "Pix" : method === "boleto" ? "Boleto" : "Cartão", transactionId: intent?.transactionId || "sandbox", paidAt: new Date().toLocaleDateString("pt-BR") } : item)); setCheckout(null); }

  return <div className="page-stack"><SectionHeader eyebrow="Financeiro" title="Pagamentos da taxa de condomínio" description="Fluxo de teste com Pix, boleto e cartão. Depois, o mesmo botão pode chamar seu back-end real." action={<button className="button button-primary" onClick={() => openCheckout("pix")}>Gerar Pix</button>} />
    <div className="payment-summary-panel"><div><p className="eyebrow">Cobrança em aberto</p><h3>{openPayment?.month || "Nenhuma cobrança"}</h3><span>{openPayment ? `Vencimento ${openPayment.dueDate}` : "Todas as taxas estão pagas."}</span></div>{openPayment && <strong>{openPayment.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</strong>}</div>
    <div className="payment-methods"><PaymentMethod title="Cartão" description="Simule aprovação com cartão de teste." image="/icons/card.svg" onClick={() => openCheckout("card")} /><PaymentMethod title="Pix" description="Gere QR Code e código copia e cola." image="/icons/pix.svg" featured onClick={() => openCheckout("pix")} /><PaymentMethod title="Boleto" description="Gere linha digitável demonstrativa." image="/icons/boleto.svg" onClick={() => openCheckout("boleto")} /></div>
    <div className="panel"><h3>Histórico de taxas</h3><div className="table-wrapper"><table><thead><tr><th>Mês</th><th>Vencimento</th><th>Valor</th><th>Método</th><th>Status</th><th>Transação</th><th>Ação</th></tr></thead><tbody>{paymentList.map((payment) => <tr key={payment.id}><td>{payment.month}</td><td>{payment.dueDate}</td><td>{payment.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</td><td>{payment.method}</td><td><StatusBadge status={payment.status} /></td><td>{payment.transactionId ? <small className="transaction-id">{payment.transactionId}</small> : "-"}</td><td>{payment.status === "Pago" ? <button className="button button-small">Comprovante</button> : <div className="table-actions"><button className="button button-small" onClick={() => openCheckout("pix", payment)}>Pix</button><button className="button button-small" onClick={() => openCheckout("boleto", payment)}>Boleto</button><button className="button button-small" onClick={() => openCheckout("card", payment)}>Cartão</button></div>}</td></tr>)}</tbody></table></div></div>
    <div className="payment-dev-note"><strong>Modo teste ativo</strong><span>Este checkout não usa chave secreta no front-end. Em produção, o front-end deve chamar seu back-end.</span></div>
    {checkout && <PaymentCheckoutModal payment={checkout.payment} method={checkout.method} user={user} onClose={() => setCheckout(null)} onPaid={finishPayment} />}
  </div>;
}
function PaymentMethod({ title, description, image, featured, onClick }) { return <article className={`method-card ${featured ? "featured-method" : ""}`}><img src={image} alt="" /><h3>{title}</h3><p>{description}</p><button className="button button-outline" type="button" onClick={onClick}>Selecionar</button></article>; }

function ReservationsPage({ reservations, onAddReservation }) {
  const [form, setForm] = useState({ space: "Churrasqueira", date: "", time: "" });
  const [error, setError] = useState("");
  function submit(event) { event.preventDefault(); if (!form.date || !form.time) { setError("Preencha data e horário para solicitar a reserva."); return; } setError(""); onAddReservation(form); setForm({ space: "Churrasqueira", date: "", time: "" }); }
  return <div className="page-stack"><SectionHeader eyebrow="Áreas comuns" title="Agendamento de reservas" description="Solicite reserva da churrasqueira, salão de festas ou quadra." />
    <div className="spaces-grid">{spaces.map((space) => <article className="space-card" key={space.name}><img src={space.icon} alt="" /><div><strong>{space.name}</strong><span>{space.capacity}</span><p>{space.description}</p></div></article>)}</div>
    <div className="two-columns"><div className="panel"><h3>Nova solicitação</h3><form className="form" onSubmit={submit}><label>Espaço<select value={form.space} onChange={(e) => setForm({ ...form, space: e.target.value })}>{spaces.map((space) => <option key={space.name}>{space.name}</option>)}</select></label><label>Data<input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label><label>Horário<input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} /></label>{error && <p className="form-error">{error}</p>}<button className="button button-primary" type="submit">Solicitar reserva</button></form></div><div className="panel"><h3>Minhas solicitações</h3><div className="list">{reservations.length === 0 ? <EmptyState title="Nenhuma reserva" description="Suas solicitações aparecerão aqui." icon="/icons/calendar.svg" /> : reservations.map((reservation) => <article className="list-item" key={reservation.id}><div><strong>{reservation.space}</strong><span>{reservation.date} às {reservation.time}</span></div><StatusBadge status={reservation.status} /></article>)}</div></div></div>
  </div>;
}

function NoticesPage({ notices }) { return <div className="page-stack"><SectionHeader eyebrow="Comunicados" title="Avisos e manutenções" description="Confira informações publicadas pelo síndico ou equipe administrativa." /><div className="notice-grid">{notices.map((notice) => <article className="notice-card" key={notice.id}><div className="notice-meta"><span>{notice.category}</span><small>{notice.date}</small></div><h3>{notice.title}</h3><p>{notice.description}</p><StatusBadge status={notice.priority} /></article>)}</div></div>; }

function TransparencyPage({ documents }) {
  const total = expenses.reduce((sum, item) => sum + item.amount, 0);
  const paidValue = documents.filter((doc) => doc.status === "Pago").reduce((sum, doc) => sum + Number(doc.amount || 0), 0);
  return <div className="page-stack"><SectionHeader eyebrow="Portal da transparência" title="Prestação de contas" description="Veja os gastos, boletos e comprovantes fictícios publicados pela administração." />
    <div className="stats-grid"><StatCard title="Arrecadação mensal" value={total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} subtitle="Valor de referência" icon="/icons/wallet.svg" trend="Dados abertos" /><StatCard title="Documentos" value={documents.length} subtitle="Boletos e comprovantes" icon="/icons/notice.svg" /><StatCard title="Comprovado" value={paidValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} subtitle="Pagamentos com comprovante" icon="/icons/shield.svg" /></div>
    <div className="panel"><h3>Distribuição dos gastos</h3><div className="expense-list">{expenses.map((item) => <ExpenseBar item={item} key={item.category} />)}</div></div>
    <div className="panel"><div className="panel-title-row"><div><h3>Documentos de transparência</h3><p>Boletos e comprovantes fictícios vinculados às despesas do condomínio.</p></div></div><DocumentList documents={documents} /></div>
  </div>;
}
