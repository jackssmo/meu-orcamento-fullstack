import { NavLink, useNavigate } from "react-router-dom";

interface HeaderProps {
  userName: string;
}

export function Header({ userName }: HeaderProps) {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("fintrack_token");
    navigate("/login");
  }

  return (
    <aside className="app-sidebar">
      <div className="brand-mark">
        <div className="brand-icon">M</div>
        <div>
          <strong>Meu Orçamento</strong>
          <span>controle financeiro pessoal</span>
        </div>
      </div>
      <nav className="sidebar-nav" aria-label="Navegação principal">
        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span>▦</span> Visão geral
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <span>○</span> Minha conta
        </NavLink>
      </nav>
      <div className="sidebar-bottom">
        <div className="profile-chip">
          <div className="avatar">{(userName || "U").charAt(0).toUpperCase()}</div>
          <div><strong>{userName || "Usuário"}</strong><span>Conta pessoal</span></div>
        </div>
        <button onClick={handleLogout} className="logout-button">← <span>Sair da conta</span></button>
      </div>
    </aside>
  );
}