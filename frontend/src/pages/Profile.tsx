import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { api } from "../services/api";
import { Header } from "../components/Header";

export function Profile() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.get("/auth/profile")
      .then((response) => {
        setName(response.data.name || "");
        setEmail(response.data.email || "");
      })
      .catch(() => toast.error("Não foi possível carregar seus dados."))
      .finally(() => setIsLoading(false));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put("/auth/profile", {
        name,
        email,
        currentPassword,
        newPassword: newPassword || undefined,
      });
      setName(response.data.name);
      setEmail(response.data.email);
      setCurrentPassword("");
      setNewPassword("");
      toast.success("Dados atualizados com sucesso.");
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message || "Não foi possível atualizar seus dados.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="app-layout">
      <Header userName={name} />
      <main className="app-content">
        <div className="page-heading">
          <div>
            <h1>Minha conta</h1>
            <p>Atualize suas informações pessoais.</p>
          </div>
        </div>
        <section className="surface max-w-2xl p-6 sm:p-8">
          {isLoading ? (
            <p className="text-sm text-[#77817e]">Carregando seus dados...</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-[#202b3c]">Dados pessoais</h2>
                <p className="mt-1 text-sm text-[#7b8798]">Essas informações aparecem apenas na sua conta.</p>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#7b8798]">Nome</span>
                <input required minLength={2} value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg border border-[#dfe3eb] px-4 py-3 outline-none focus:border-[#2454a6] focus:ring-2 focus:ring-[#c8d9f5]" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#7b8798]">E-mail</span>
                <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full rounded-lg border border-[#dfe3eb] px-4 py-3 outline-none focus:border-[#2454a6] focus:ring-2 focus:ring-[#c8d9f5]" />
              </label>
              <div className="border-t border-[#e2e3de] pt-5">
                <h2 className="text-lg font-semibold text-[#243238]">Alterar senha</h2>
                <p className="mt-1 text-sm text-[#7b8798]">Deixe em branco para manter a senha atual.</p>
              </div>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#7b8798]">Senha atual</span>
                <input required type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className="w-full rounded-lg border border-[#dfe3eb] px-4 py-3 outline-none focus:border-[#2454a6] focus:ring-2 focus:ring-[#c8d9f5]" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-wide text-[#7b8798]">Nova senha (opcional)</span>
                <input minLength={6} type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className="w-full rounded-lg border border-[#dfe3eb] px-4 py-3 outline-none focus:border-[#2454a6] focus:ring-2 focus:ring-[#c8d9f5]" />
              </label>
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => navigate("/dashboard")} className="rounded-lg border border-[#dfe3eb] px-5 py-3 text-sm font-semibold text-[#52627a] hover:bg-[#f5f7fa]">Cancelar</button>
                <button type="submit" disabled={isSaving} className="rounded-lg bg-[#2454a6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1c4386] disabled:opacity-60">{isSaving ? "Salvando..." : "Salvar alterações"}</button>
              </div>
            </form>
          )}
        </section>
      </main>
    </div>
  );
}
