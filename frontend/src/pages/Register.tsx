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
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Meu Orçamento</h1>
          <p className="text-indigo-200">Crie a sua conta para começar</p>
        </div>
        
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-6">Nova Conta</h2>
          
          <form className="space-y-4" onSubmit={handleRegister}>
            {/* Campo NOME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Campo E-MAIL */}
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
            
            {/* Campo SENHA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Campo CONFIRMAR SENHA */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-2 px-4 rounded-lg font-medium transition duration-200 disabled:opacity-70 mt-2"
            >
              {isLoading ? "Criando..." : "Criar Conta"}
            </button>
          </form>
          
          <p className="text-center text-gray-500 text-sm mt-6">
            Já tem uma conta?{" "}
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">
              Faça Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}