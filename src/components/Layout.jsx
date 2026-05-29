import Header from "./Header.jsx";
import Sidebar from "./Sidebar.jsx";

export default function Layout({ user, activeTab, tabs, onChangeTab, onLogout, children }) {
  return (
    <div className="app-shell">
      <Sidebar activeTab={activeTab} tabs={tabs} onChangeTab={onChangeTab} user={user} />
      <main className="main-area">
        <Header user={user} onLogout={onLogout} />
        <section className="content-area">{children}</section>
      </main>
    </div>
  );
}
