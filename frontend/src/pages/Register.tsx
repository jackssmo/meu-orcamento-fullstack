import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import toast from "react-hot-toast";
import { isAxiosError } from "axios";

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister(e: FormEvent) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);

    try {
      await api.post("/auth/register", { name, email, password });
      
      toast.success("Conta criada com sucesso! Faça o login.");
      
      navigate("/login");
    } catch (error) {
      if (isAxiosError(error)) {
        toast.error(error.response?.data?.error || "Erro ao criar conta.");
      } else {
        toast.error("Erro inesperado.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-[#f5f7fa] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-[#e2e3de] overflow-hidden">
        <div className="bg-[#152d52] p-8">
          <div className="text-white text-xl font-bold tracking-tight mb-10">Meu Orçamento</div>
          <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Comece pelo<br />seu primeiro mês.</h1>
          <p className="text-[#b7c8e5] text-sm">Organização financeira sem complicação.</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-xl font-semibold text-[#243238] mb-6">Criar uma conta</h2>
          
          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Campo NOME */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#7b8798] mb-2">Nome completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-3 border border-[#dfe3eb] rounded-lg focus:ring-2 focus:ring-[#c8d9f5] focus:border-[#2454a6] outline-none"
              />
            </div>

            {/* Campo E-MAIL */}
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
            
            {/* Campo SENHA */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#7b8798] mb-2">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-[#dfe3eb] rounded-lg focus:ring-2 focus:ring-[#c8d9f5] focus:border-[#2454a6] outline-none"
              />
            </div>

            {/* Campo CONFIRMAR SENHA */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-[#7b8798] mb-2">Confirmar senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 border border-[#dfe3eb] rounded-lg focus:ring-2 focus:ring-[#c8d9f5] focus:border-[#2454a6] outline-none"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#2454a6] hover:bg-[#1c4386] text-white py-3 px-4 rounded-lg font-semibold transition duration-200 disabled:opacity-70 mt-2"
            >
              {isLoading ? "Criando..." : "Criar Conta"}
            </button>
          </form>
          
          <p className="text-center text-[#7b8798] text-sm mt-6">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-[#2454a6] hover:underline font-semibold">
              Faça Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}