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
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#f5f7fa] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-[#e4e9f0] overflow-hidden">
        <div className="bg-[#152d52] p-8">
          <div className="mb-10 text-center text-3xl font-bold tracking-tight text-white">Meu Orçamento</div>
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Boas-vindas!</h1>
          <p className="text-[#b7c8e5] text-sm">Tenha clareza sobre o seu dinheiro.</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold text-[#202b3c] mb-6">Entrar na sua conta</h2>
          
          <form className="space-y-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#7b8798] mb-2">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#dfe3eb] rounded-lg focus:ring-2 focus:ring-[#c8d9f5] focus:border-[#2454a6] outline-none"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#7b8798] mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#dfe3eb] rounded-lg focus:ring-2 focus:ring-[#c8d9f5] focus:border-[#2454a6] outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2454a6] hover:bg-[#1c4386] text-white py-3 px-4 rounded-lg font-semibold transition duration-200 disabled:opacity-70"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </form>
          
          <p className="text-center text-[#7b8798] text-sm mt-6">
            Não tem uma conta?{" "}
            {/* O Link do React Router evita que a página recarregue ao trocar de tela */}
            <Link to="/register" className="text-[#2454a6] hover:underline font-semibold">
              Registre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}