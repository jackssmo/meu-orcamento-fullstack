// frontend/src/components/Header.tsx
import { useNavigate } from "react-router-dom";

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
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3 text-white font-bold">
            MO
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Meu Orçamento</h1>
            <p className="text-sm text-gray-500">
              Bem-vindo,{" "}
              <span className="font-medium text-indigo-600">
                {userName || "..."}
              </span>
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-medium transition"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
