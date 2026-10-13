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
  const [cards, setCards] = useState<{ id: number; name: string }[]>([]);
  const [newCard, setNewCard] = useState("");
  const [editingCardId, setEditingCardId] = useState<number | null>(null);
  const [editingCardName, setEditingCardName] = useState("");

  useEffect(() => {
    api.get("/auth/profile")
      .then((response) => {
        setName(response.data.name || "");
        setEmail(response.data.email || "");
      })
      .catch(() => toast.error("Não foi possível carregar seus dados."))
      .finally(() => setIsLoading(false));
    api.get("/financial/cards")
      .then((response) => setCards(response.data))
      .catch(() => toast.error("Não foi possível carregar seus cartões."));
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

  async function addCard(event: FormEvent) {
    event.preventDefault();
    if (!newCard.trim()) return;
    try {
      const response = await api.post("/financial/cards", { name: newCard.trim() });
      setCards((current) => [response.data, ...current]);
      setNewCard("");
      toast.success("Cartão cadastrado.");
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message || "Não foi possível cadastrar o cartão.");
    }
  }

  async function removeCard(id: number) {
    if (!window.confirm("Excluir este cartão da sua lista? As despesas antigas serão mantidas.")) return;
    try {
      await api.delete(`/financial/cards/${id}`);
      setCards((current) => current.filter((card) => card.id !== id));
      toast.success("Cartão removido.");
    } catch {
      toast.error("Não foi possível remover o cartão.");
    }
  }

  function startEditingCard(card: { id: number; name: string }) {
    setEditingCardId(card.id);
    setEditingCardName(card.name);
  }

  async function saveCard(event: FormEvent, id: number) {
    event.preventDefault();
    const normalizedName = editingCardName.trim();
    if (normalizedName.length < 2) return;

    try {
      const response = await api.patch(`/financial/cards/${id}`, { name: normalizedName });
      setCards((current) => current.map((card) => card.id === id ? response.data : card));
      setEditingCardId(null);
      setEditingCardName("");
      toast.success("Cartão atualizado.");
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.error : undefined;
      toast.error(message || "Não foi possível atualizar o cartão.");
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
        <section className="surface mt-6 max-w-2xl p-6 sm:p-8">
          <h2 className="text-lg font-semibold text-[#202b3c]">Meus cartões</h2>
          <p className="mt-1 text-sm text-[#7b8798]">Cadastre os cartões que aparecem nas suas despesas.</p>
          <form onSubmit={addCard} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <input
              required
              minLength={2}
              maxLength={120}
              value={newCard}
              onChange={(event) => setNewCard(event.target.value)}
              placeholder="Ex.: Nubank Visa"
              className="min-w-0 flex-1 rounded-lg border border-[#dfe3eb] px-4 py-3 outline-none focus:border-[#2454a6] focus:ring-2 focus:ring-[#c8d9f5]"
            />
            <button type="submit" className="rounded-lg bg-[#2454a6] px-5 py-3 text-sm font-semibold text-white hover:bg-[#1c4386]">Adicionar cartão</button>
          </form>
          <div className="mt-5 space-y-2">
            {cards.map((card) => (
              <div key={card.id} className="flex items-center justify-between rounded-lg border border-[#e4e9f0] px-4 py-3">
                {editingCardId === card.id ? (
                  <form onSubmit={(event) => void saveCard(event, card.id)} className="flex w-full flex-col gap-2 sm:flex-row">
                    <input
                      required
                      minLength={2}
                      maxLength={120}
                      value={editingCardName}
                      onChange={(event) => setEditingCardName(event.target.value)}
                      className="min-w-0 flex-1 rounded-lg border border-[#dfe3eb] px-3 py-2 outline-none focus:border-[#2454a6] focus:ring-2 focus:ring-[#c8d9f5]"
                      autoFocus
                    />
                    <button type="submit" className="text-sm font-semibold text-[#2454a6] hover:text-[#1c4386]">Salvar</button>
                    <button type="button" onClick={() => setEditingCardId(null)} className="text-sm font-semibold text-slate-500 hover:text-slate-700">Cancelar</button>
                  </form>
                ) : (
                  <>
                    <span className="font-medium text-[#243238]">{card.name}</span>
                    <div className="flex gap-3">
                      <button type="button" onClick={() => startEditingCard(card)} className="text-sm font-semibold text-[#2454a6] hover:text-[#1c4386]">Editar</button>
                      <button type="button" onClick={() => void removeCard(card.id)} className="text-sm font-semibold text-red-600 hover:text-red-800">Excluir</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
