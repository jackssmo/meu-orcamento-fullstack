import { isAxiosError } from "axios";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";

export function Login() {
  const navigate = useNavigate();

  // Estados para capturar o que o utilizador escreve
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estados de feedback visual
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setError("");

    try {
      setIsLoading(true);

      // Fazemos o pedido POST à tua rota de login no Node.js
      const response = await api.post("/login", {
        email,
        password,
      });

      // Se der sucesso, o backend devolve o token. Guardamo-lo no browser!
      localStorage.setItem("fintrack_token", response.data.token);

      // E redirecionamos o utilizador para o Dashboard
      navigate("/dashboard");
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
          <p className="text-indigo-200">
            Controle as suas finanças de forma simples
          </p>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">
            Entrar na sua Conta
          </h2>

          {/* Caixa de erro, caso exista algum */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleLogin}>
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
                placeholder="A sua palavra-passe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="flex justify-end mt-1">
                <a href="#" className="text-sm text-indigo-600 hover:underline">
                  Esqueceu a palavra-passe?
                </a>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200 disabled:opacity-70"
            >
              {isLoading ? "A entrar..." : "Entrar"}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Não tem uma conta?{" "}
            <Link
              to="/register"
              className="text-indigo-600 hover:underline font-medium"
            >
              Registe-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
