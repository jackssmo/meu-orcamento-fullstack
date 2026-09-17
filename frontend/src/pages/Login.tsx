import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {

      const response = await api.post("/auth/login", { email, password });
      
      localStorage.setItem("fintrack_token", response.data.token);
      
      toast.success("Login realizado com sucesso!");

      navigate("/dashboard");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error || "E-mail ou senha incorretos.");
      } else {
        toast.error("Ocorreu um erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Orçamento</h1>
          <p className="text-indigo-200">Controle as suas finanças de forma simples</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Entrar</h2>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium transition duration-200 disabled:opacity-70"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            Não tem uma conta?{" "}
            {/* O Link do React Router evita que a página recarregue ao trocar de tela */}
            <Link to="/register" className="text-indigo-600 hover:underline font-medium">
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}