export default function Sidebar({ activeTab, tabs, onChangeTab, user }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <img className="brand-logo" src="/logo-icon.png" alt="Logo Kondo" />
        <div><strong>Kondo</strong><span>Seu condomínio mais simples, claro e conectado.</span></div>
      </div>
      <nav className="nav-menu">
        {tabs.map((tab) => (
          <button key={tab.id} className={`nav-item ${activeTab === tab.id ? "active" : ""}`} onClick={() => onChangeTab(tab.id)}>
            <img src={tab.icon} alt="" aria-hidden="true" /><span>{tab.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-upgrade"><div className="upgrade-icon"><img src="/icons/spark.svg" alt="" /></div><strong>Pronto para API</strong><span>Camada de serviços preparada para integrar autenticação, pagamentos e gestão real.</span></div>
      <div className="sidebar-card"><small>Perfil conectado</small><strong>{user.name}</strong><span>{user.email}</span></div>
    </aside>
  );
}
