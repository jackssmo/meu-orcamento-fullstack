import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("sidebar_collapsed") === "true");

  function toggleSidebar() {
    setCollapsed((current) => {
      const next = !current;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  }

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  return (
    <aside className={`app-sidebar${collapsed ? " collapsed" : ""}`}>
      <button
        type="button"
        className="sidebar-toggle"
        onClick={toggleSidebar}
        aria-label={collapsed ? "Mostrar menu lateral" : "Esconder menu lateral"}
        title={collapsed ? "Mostrar menu" : "Esconder menu"}
      >
        {collapsed ? "›" : "‹"}
      </button>
      <div className="brand-mark">
        <div className="brand-icon">M</div>
        <div>
          <strong>Meu Orçamento</strong>
          <span>controle financeiro pessoal</span>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span>▦</span><b>Visão geral</b>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span>○</span><b>Minha conta</b>
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="profile-chip">
          <div className="avatar">{(userName || "U").charAt(0).toUpperCase()}</div>
          <div className="profile-details"><strong>{userName || "Usuário"}</strong><span>Conta pessoal</span></div>
        </div>
        <button onClick={handleLogout} className="logout-button">← <span>Sair da conta</span></button>
      </div>
    </aside>
  );
}