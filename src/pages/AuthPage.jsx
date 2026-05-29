import { useState } from "react";
import { appConfig } from "../config/appConfig.js";

const emptyForm = { name: "", email: "", password: "", apartment: "", role: "resident" };

const demoAccounts = [
  { label: "Morador", role: "resident", email: "morador@kondo.com", password: "123456" },
  { label: "Síndico", role: "staff", email: "sindico@kondo.com", password: "123456" },
];

export default function AuthPage({ onAuthenticate }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  function updateField(field, value) {
    setError("");
    setForm((current) => ({ ...current, [field]: value }));
  }

  function switchMode(nextMode) {
    setMode(nextMode);
    setError("");
    setForm(emptyForm);
  }

  function fillDemo(account) {
    setMode("login");
    setError("");
    setForm({
      ...emptyForm,
      role: account.role,
      email: account.email,
      password: account.password,
      apartment: account.role === "resident" ? "204B" : "Administração",
    });
  }

  function submit(event) {
    event.preventDefault();
    const result = onAuthenticate(form, mode);
    if (!result?.ok) setError(result?.message || "Não foi possível continuar.");
  }

  return (
    <main className="auth-page">
      <section className="auth-hero">
        <div className="floating-card floating-card-one"><span>Reservas</span><strong>3 pendentes</strong></div>
        <div className="floating-card floating-card-two"><span>Financeiro</span><strong>87% saudável</strong></div>
        <div className="hero-card">
          <div className="auth-brand"><img src="/logo-icon.png" alt="Logo Kondo" /><div><span className="eyebrow">{appConfig.description}</span><h1>{appConfig.name}</h1></div></div>
          <p className="hero-lead">Um portal completo para moradores, síndicos e equipes de apoio.</p>
          <p>Pagamentos, reservas, avisos, inadimplência e transparência em uma interface harmoniosa, clara e preparada para uso real.</p>
          <div className="hero-showcase">
            <div className="showcase-main"><div className="showcase-top"><span>Saúde da gestão</span><strong>87%</strong></div><div className="mini-bars"><span style={{ height: "48%" }} /><span style={{ height: "62%" }} /><span style={{ height: "38%" }} /><span style={{ height: "78%" }} /><span style={{ height: "58%" }} /><span style={{ height: "88%" }} /></div></div>
            <div className="showcase-list"><div><strong>Morador</strong><span>Taxas, reservas, avisos e prestação de contas.</span></div><div><strong>Síndico / Staff</strong><span>Inadimplência, aprovações, mural e gastos.</span></div></div>
          </div>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-card-logo"><img src="/logo-icon.png" alt="Kondo" /></div>
          <div className="auth-tabs"><button className={mode === "login" ? "active" : ""} onClick={() => switchMode("login")} type="button">Login</button><button className={mode === "register" ? "active" : ""} onClick={() => switchMode("register")} type="button">Cadastro</button></div>
          <div className="auth-title"><p className="eyebrow">{mode === "login" ? "Acessar conta" : "Criar acesso"}</p><h2>{mode === "login" ? "Bem-vindo ao Kondo" : "Comece pelo Kondo"}</h2><span>{mode === "login" ? "Use uma conta cadastrada para acessar o painel correto." : "O cadastro valida e-mail e apartamento para evitar usuários duplicados."}</span></div>
          <form className="form" onSubmit={submit}>
            <label>Tipo de usuário<select value={form.role} onChange={(e) => updateField("role", e.target.value)}><option value="resident">Morador</option><option value="staff">Síndico / Staff</option></select></label>
            {mode === "register" && <label>Nome completo<input type="text" placeholder="Ex: Marcos Correia" value={form.name} onChange={(e) => updateField("name", e.target.value)} /></label>}
            <label>E-mail<input type="email" placeholder="usuario@email.com" value={form.email} onChange={(e) => updateField("email", e.target.value)} /></label>
            {form.role === "resident" && <label>Apartamento / Bloco<input type="text" placeholder="Ex: 204B" value={form.apartment} onChange={(e) => updateField("apartment", e.target.value)} /></label>}
            <label>Senha<input type="password" placeholder="Mínimo de 6 caracteres" value={form.password} onChange={(e) => updateField("password", e.target.value)} /></label>
            {error && <p className="form-error">{error}</p>}
            <button className="button button-primary button-full" type="submit">{mode === "login" ? "Entrar no Kondo" : "Criar cadastro"}</button>
          </form>

          <div className="demo-accounts">
            <strong>Contas de teste</strong>
            {demoAccounts.map((account) => (
              <button key={account.email} type="button" onClick={() => fillDemo(account)}>
                <span>{account.label}</span>
                <small>{account.email} / {account.password}</small>
              </button>
            ))}
          </div>

          <p className="auth-help">Projeto final apenas com front-end e dados mockados. A autenticação é demonstrativa e usa localStorage.</p>
        </div>
      </section>
    </main>
  );
}
