export default function Header({ user, onLogout }) {
  return (
    <header className="header">
      <div className="header-copy">
        <p className="eyebrow">Kondo • Gestão de condomínios</p>
        <h1>Olá, {user.name}</h1>
        <span>{user.role === "staff" ? "Acompanhe a operação do condomínio em tempo real." : "Tudo do seu condomínio em um único painel."}</span>
      </div>
      <div className="header-actions">
        <div className="search-box"><img src="/icons/search.svg" alt="" aria-hidden="true" /><input placeholder="Buscar no sistema" /></div>
        <div className="user-pill"><span>{user.role === "staff" ? "Síndico / Staff" : "Morador"}</span><strong>{user.apartment || "Administração"}</strong></div>
        <button className="button button-outline" onClick={onLogout}>Sair</button>
      </div>
    </header>
  );
}
