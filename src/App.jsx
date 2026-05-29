import { useEffect, useMemo, useState } from "react";
import AuthPage from "./pages/AuthPage.jsx";
import ResidentDashboard from "./pages/ResidentDashboard.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import Toast from "./components/Toast.jsx";
import SplashScreen from "./components/SplashScreen.jsx";
import {
  initialNotices,
  initialReservations,
  initialTransparencyDocuments,
  initialUsers,
} from "./data/mockData.js";
import { loadStorage, removeStorage, saveStorage } from "./services/storage.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeApartment(apartment) {
  return String(apartment || "").trim().toUpperCase().replace(/\s+/g, "");
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState(() => loadStorage("users", initialUsers));
  const [user, setUser] = useState(() => loadStorage("user", null));
  const [notices, setNotices] = useState(() => loadStorage("notices", initialNotices));
  const [reservations, setReservations] = useState(() => loadStorage("reservations", initialReservations));
  const [documents, setDocuments] = useState(() => loadStorage("transparencyDocuments", initialTransparencyDocuments));
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 650);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => saveStorage("users", users), [users]);
  useEffect(() => saveStorage("notices", notices), [notices]);
  useEffect(() => saveStorage("reservations", reservations), [reservations]);
  useEffect(() => saveStorage("transparencyDocuments", documents), [documents]);

  const totals = useMemo(() => ({
    notices: notices.length,
    pendingReservations: reservations.filter((item) => item.status === "Pendente").length,
    approvedReservations: reservations.filter((item) => item.status === "Aprovada").length,
    documents: documents.length,
    paidDocuments: documents.filter((item) => item.status === "Pago").length,
  }), [notices, reservations, documents]);

  function notify(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3600);
  }

  function authenticate(form, mode) {
    const email = normalizeEmail(form.email);
    const password = String(form.password || "").trim();
    const role = form.role;

    if (!email || !password) {
      return { ok: false, message: "Preencha e-mail e senha para continuar." };
    }

    if (mode === "login") {
      const found = users.find((item) => normalizeEmail(item.email) === email);

      if (!found) {
        return { ok: false, message: "Usuário não encontrado. Verifique o e-mail ou crie uma conta." };
      }

      if (found.role !== role) {
        return { ok: false, message: "Este e-mail existe, mas pertence a outro tipo de perfil." };
      }

      if (found.password !== password) {
        return { ok: false, message: "Senha incorreta. Tente novamente." };
      }

      const safeUser = sanitizeUser(found);
      setUser(safeUser);
      saveStorage("user", safeUser);
      notify(`Bem-vindo ao Kondo, ${found.name}!`);
      return { ok: true };
    }

    const name = String(form.name || "").trim();
    const apartment = role === "staff" ? "Administração" : normalizeApartment(form.apartment);

    if (name.length < 3) {
      return { ok: false, message: "Informe o nome completo para cadastrar." };
    }

    if (password.length < 6) {
      return { ok: false, message: "A senha precisa ter pelo menos 6 caracteres." };
    }

    if (role === "resident" && !apartment) {
      return { ok: false, message: "Informe apartamento/bloco do morador." };
    }

    const duplicateEmail = users.some((item) => normalizeEmail(item.email) === email);
    if (duplicateEmail) {
      return { ok: false, message: "Já existe um usuário cadastrado com este e-mail." };
    }

    const duplicateApartment = role === "resident" && users.some((item) => item.role === "resident" && normalizeApartment(item.apartment) === apartment);
    if (duplicateApartment) {
      return { ok: false, message: "Já existe um morador cadastrado para este apartamento/bloco." };
    }

    const newUser = {
      id: Date.now(),
      name,
      email,
      password,
      apartment,
      role,
      createdAt: new Date().toISOString(),
    };

    setUsers((current) => [newUser, ...current]);
    const safeUser = sanitizeUser(newUser);
    setUser(safeUser);
    saveStorage("user", safeUser);
    notify("Cadastro criado com sucesso. Bem-vindo ao Kondo!");
    return { ok: true };
  }

  function handleLogout() {
    setUser(null);
    removeStorage("user");
    notify("Sessão encerrada com segurança.");
  }

  function addReservation(newReservation) {
    setReservations((current) => [{ id: Date.now(), resident: user?.name || "Morador", apartment: user?.apartment || "000", status: "Pendente", ...newReservation }, ...current]);
    notify("Reserva solicitada. Aguarde a análise do síndico/staff.");
  }

  function updateReservationStatus(id, status) {
    setReservations((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
    notify(`Reserva ${status.toLowerCase()} com sucesso.`);
  }

  function addNotice(newNotice) {
    const today = new Date().toLocaleDateString("pt-BR");
    setNotices((current) => [{ id: Date.now(), date: today, ...newNotice }, ...current]);
    notify("Aviso publicado no mural.");
  }

  function addTransparencyDocument(file) {
    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "image/png",
      "image/jpeg",
      "image/webp",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    const isAllowed = allowedTypes.includes(file.type) || /\.(pdf|png|jpe?g|webp|docx?)$/i.test(file.name);
    if (!isAllowed) {
      notify("Formato inválido. Envie PDF, imagem, DOC ou DOCX.", "error");
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      notify("Documento muito grande. O limite de teste é 10 MB.", "error");
      return;
    }

    const today = new Date().toLocaleDateString("pt-BR");
    const temporaryUrl = URL.createObjectURL(file);

    const newDocument = {
      id: Date.now(),
      title: file.name.replace(/\.[^/.]+$/, ""),
      type: "Documento enviado",
      category: "Outros",
      competence: "Maio/2026",
      supplier: "Envio manual",
      amount: 0,
      dueDate: today,
      paidAt: null,
      status: "Em análise",
      fileName: file.name,
      fileUrl: temporaryUrl,
      isUploaded: true,
      description: "Documento selecionado manualmente no computador para teste de front-end.",
    };

    setDocuments((current) => [newDocument, ...current]);
    notify("Documento adicionado à transparência.");
  }

  if (loading) return <SplashScreen />;

  return (
    <>
      {!user ? (
        <AuthPage onAuthenticate={authenticate} />
      ) : user.role === "staff" ? (
        <StaffDashboard
          user={user}
          totals={totals}
          notices={notices}
          reservations={reservations}
          documents={documents}
          onLogout={handleLogout}
          onAddNotice={addNotice}
          onUpdateReservation={updateReservationStatus}
          onAddDocument={addTransparencyDocument}
        />
      ) : (
        <ResidentDashboard
          user={user}
          totals={totals}
          notices={notices}
          reservations={reservations}
          documents={documents}
          onLogout={handleLogout}
          onAddReservation={addReservation}
        />
      )}
      <Toast message={toast?.message} type={toast?.type} onClose={() => setToast(null)} />
    </>
  );
}
