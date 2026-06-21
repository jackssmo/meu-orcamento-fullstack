import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export function Register() {
  const navigate = useNavigate();

  // Estados para guardar o que o utilizador escreve
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Estados para gerir feedback visual (carregamento e erros)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: FormEvent) {
    e.preventDefault(); // Evita que a página recarregue
    setError("");

    // Validação básica de palavra-passe
    if (password !== confirmPassword) {
      setError("As palavras-passe não coincidem.");
      return;
    }

    try {
      setIsLoading(true);

      // Chamada real ao teu backend Node.js (rota que já criaste no authRoutes.ts)
      await api.post("/signup", {
        name,
        email,
        password,
      });

      // Se sucesso, redireciona o utilizador para a página de login
      navigate("/login");
    } catch (error) {
      // Verificamos se o erro veio da nossa API (Axios)
      if (isAxiosError(error)) {
        setError(error.response?.data?.error || "Ocorreu um erro.");
      } else {
        setError("Erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-indigo-500/10 to-emerald-500/10 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Orçamento</h1>
          <p className="text-indigo-200">Crie a sua conta para começar</p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Criar Nova Conta
          </h2>

          {/* Mostra o erro, se existir */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          {/* Ligar a função onSubmit ao nosso formulário */}
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="O seu nome"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Palavra-passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma palavra-passe"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Palavra-passe
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme a sua palavra-passe"
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200 disabled:opacity-70"
            >
              {isLoading ? "A criar conta..." : "Criar Conta"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Já tem uma conta?{" "}
            <Link
              to="/login"
              className="text-indigo-600 hover:underline font-medium"
            >
              Faça Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
