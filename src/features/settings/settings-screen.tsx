"use client";

import { Download, LogOut, Palette, Plus, ShieldCheck, Smartphone, Trash2, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, messageFromError } from "@/shared/api/client";
import type { Category, User } from "@/shared/api/types";
import { MobileAppNav } from "@/shared/ui/app-navigation";
import { ErrorPanel, LoadingPanel, PageHeader } from "@/shared/ui/page-header";
import { ChangePasswordForm } from "./change-password-form";


export function SettingsScreen() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [purpose, setPurpose] = useState<"expense" | "income">("expense");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [currentUser, categoryResponse] = await Promise.all([
        apiRequest<User>("/me"),
        apiRequest<{ items: Category[] }>("/categories")
      ]);
      setUser(currentUser);
      setName(currentUser.name);
      setCategories(categoryResponse.items);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.replace("/login");
        return;
      }
      setError(messageFromError(requestError));
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function saveProfile() {
    setPending(true);
    try {
      const updated = await apiRequest<User>("/me", {
        method: "PATCH",
        body: JSON.stringify({ name, timezone: user?.timezone, currency: "BRL" })
      });
      setUser(updated);
    } catch (requestError) { setError(messageFromError(requestError)); }
    finally { setPending(false); }
  }

  async function createCategory() {
    if (!categoryName.trim()) return;
    setPending(true);
    try {
      await apiRequest("/categories", {
        method: "POST",
        body: JSON.stringify({ name: categoryName, purpose, color: purpose === "expense" ? "#b54747" : "#0f6b57" })
      });
      setCategoryName("");
      await load();
    } catch (requestError) { setError(messageFromError(requestError)); }
    finally { setPending(false); }
  }

  async function archiveCategory(id: string) {
    try {
      await apiRequest("/categories/" + id, { method: "DELETE" });
      await load();
    } catch (requestError) { setError(messageFromError(requestError)); }
  }

  async function logout() {
    await apiRequest("/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 lg:px-8 lg:pb-8">
      <PageHeader title="Ajustes" active="settings" />
      {error && <ErrorPanel message={error} />}
      {!user && !error && <LoadingPanel />}
      {user && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="grid gap-4">
          <section className="min-w-0 rounded-xl border border-[#dde4df] bg-white/90 p-4 shadow-sm sm:p-6">
            <div>
              <h2 className="text-lg font-semibold">Perfil</h2>

              <p className="mt-1 text-sm text-[#66746e]">
                Atualize suas informações pessoais.
              </p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid min-w-0 gap-2 text-sm font-medium">
                Nome

                <input
                  className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </label>

              <label className="grid min-w-0 gap-2 text-sm font-medium">
                E-mail

                <input
                  className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-[#f3f5f3] px-3 text-[#66746e]"
                  value={user.email}
                  disabled
                />
              </label>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[#0f6b57] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#0c5747] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                disabled={pending}
                onClick={() => void saveProfile()}
                type="button"
              >
                {pending ? "Salvando..." : "Salvar perfil"}
              </button>
            </div>

            <ChangePasswordForm />
          </section>
            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2"><Plus size={20} className="text-[#0f6b57]" /><h2 className="text-lg font-semibold">Categorias</h2></div>
              <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
                <input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" placeholder="Nome da categoria" value={categoryName} onChange={(event) => setCategoryName(event.target.value)} />
                <select className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" value={purpose} onChange={(event) => setPurpose(event.target.value as "expense" | "income")}><option value="expense">Despesa</option><option value="income">Receita</option></select>
                <button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white" onClick={() => void createCategory()} type="button">Adicionar</button>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                {categories.map((category) => <article className="flex items-center justify-between gap-3 rounded-lg bg-[#fbfbf8] p-3" key={category.id}><div><strong className="block">{category.name}</strong><span className="text-sm text-[#66746e]">{category.purpose === "expense" ? "Despesa" : "Receita"}</span></div><button className="grid size-9 place-items-center rounded-lg text-[#a43b32] hover:bg-[#a43b32]/10" onClick={() => void archiveCategory(category.id)} title="Arquivar categoria" type="button"><Trash2 size={17} /></button></article>)}
              </div>
            </section>
          </div>
          <aside className="grid h-fit gap-3 lg:sticky lg:top-24">
            {user.role === "admin" && (
              <a className="rounded-lg border border-[#0f6b57]/30 bg-[#f0f7f2] p-4 shadow-sm" href="/admin">
                <UsersRound className="text-[#0f6b57]" size={22} />
                <strong className="mt-4 block">Administracao</strong>
                <span className="mt-1 block text-sm text-[#66746e]">Gerenciar usuarios e contas</span>
              </a>
            )}
            <Setting icon={ShieldCheck} title="Seguranca" value="Sessao protegida por cookie HttpOnly" />
            <Setting icon={Smartphone} title="PWA" value="Operacoes financeiras exigem conexao" />
            <Setting icon={Palette} title="Moeda" value={user.currency} />
            <a className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm" href="/api/backend/exports/transactions" download><Download className="text-[#0f6b57]" size={22} /><strong className="mt-4 block">Exportar dados</strong><span className="mt-1 block text-sm text-[#66746e]">Baixar extrato em CSV</span></a>
            <button className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-[#e8cbc7] bg-[#fff5f3] font-semibold text-[#a43b32]" onClick={() => void logout()} type="button"><LogOut size={18} />Sair da conta</button>
          </aside>
        </div>
      )}
      <MobileAppNav active="settings" />
    </main>
  );
}

function Setting({ icon: Icon, title, value }: { icon: typeof ShieldCheck; title: string; value: string }) {
  return <article className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm"><Icon className="text-[#0f6b57]" size={22} /><strong className="mt-4 block">{title}</strong><span className="mt-1 block text-sm text-[#66746e]">{value}</span></article>;
}
