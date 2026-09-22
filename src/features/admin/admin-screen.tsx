"use client";

import { Landmark, UserPlus, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, centsFromInput, messageFromError, todayISO } from "@/shared/api/client";
import type { User } from "@/shared/api/types";
import { formatShortDate } from "@/shared/lib/format";
import { MobileAppNav } from "@/shared/ui/app-navigation";
import { ErrorPanel, LoadingPanel, PageHeader } from "@/shared/ui/page-header";

export function AdminScreen() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountName, setAccountName] = useState("");
  const [institution, setInstitution] = useState("");
  const [openingBalance, setOpeningBalance] = useState("0,00");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      const me = await apiRequest<User>("/me");
      if (me.role !== "admin") {
        router.replace("/settings");
        return;
      }
      const response = await apiRequest<{ items: User[] }>("/admin/users");
      setUsers(response.items);
      setSelectedUserId((current) => current || response.items.find((item) => item.role === "user")?.id || response.items[0]?.id || "");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.replace("/login");
        return;
      }
      if (requestError instanceof ApiError && requestError.status === 403) {
        router.replace("/settings");
        return;
      }
      setError(messageFromError(requestError));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function createUser() {
    if (!userName.trim() || !email.trim() || password.length < 8) return;
    setPending(true); setError(""); setSuccess("");
    try {
      const user = await apiRequest<User>("/admin/users", {
        method: "POST",
        body: JSON.stringify({ name: userName, email, password })
      });
      setUserName(""); setEmail(""); setPassword("");
      setSelectedUserId(user.id);
      setSuccess("Usuario criado com sucesso.");
      await load();
    } catch (requestError) { setError(messageFromError(requestError)); }
    finally { setPending(false); }
  }

  async function createAccount() {
    const openingBalanceCents = centsFromInput(openingBalance);
    if (!selectedUserId || !accountName.trim()) return;
    setPending(true); setError(""); setSuccess("");
    try {
      await apiRequest("/admin/users/" + selectedUserId + "/accounts", {
        method: "POST",
        body: JSON.stringify({
          name: accountName,
          institution,
          type: "checking",
          openingBalanceCents,
          openedOn: todayISO(),
          color: "#0f6b57"
        })
      });
      setAccountName(""); setInstitution(""); setOpeningBalance("0,00");
      setSuccess("Conta financeira criada e vinculada ao usuario.");
    } catch (requestError) { setError(messageFromError(requestError)); }
    finally { setPending(false); }
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 lg:px-8 lg:pb-8">
      <PageHeader title="Administracao" active="settings" />
      {error && <ErrorPanel message={error} />}
      {success && <p className="mb-4 rounded-lg border border-[#b8d8c8] bg-[#f0f7f2] p-3 text-sm text-[#0f6b57]">{success}</p>}
      {loading && <LoadingPanel />}
      {!loading && (
        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,380px)] xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="min-w-0 rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
            <div className="flex items-center gap-2"><UsersRound className="text-[#0f6b57]" size={22} /><h2 className="text-lg font-semibold">Usuarios</h2></div>
            <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {users.map((user) => (
                <article className="min-w-0 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4" key={user.id}>
                  <div className="flex items-start justify-between gap-3"><div className="min-w-0"><strong className="block truncate">{user.name}</strong><span className="block truncate text-sm text-[#66746e]">{user.email}</span></div><span className="rounded-full bg-[#e7f1ec] px-2 py-1 text-xs font-semibold text-[#0f6b57]">{user.role === "admin" ? "Admin" : "Usuario"}</span></div>
                  <span className="mt-4 block text-xs text-[#66746e]">Criado em {formatShortDate(user.createdAt.slice(0, 10))}</span>
                </article>
              ))}
            </div>
          </section>
          <aside className="grid min-w-0 h-fit gap-4 lg:sticky lg:top-24">
            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm">
              <div className="flex items-center gap-2"><UserPlus className="text-[#0f6b57]" size={20} /><h2 className="font-semibold">Novo usuario</h2></div>
              <div className="mt-4 grid gap-3"><Field label="Nome" value={userName} onChange={setUserName} /><Field label="E-mail" value={email} onChange={setEmail} type="email" /><Field label="Senha inicial" value={password} onChange={setPassword} type="password" /><button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white disabled:opacity-60" disabled={pending} onClick={() => void createUser()} type="button">Criar usuario</button></div>
            </section>
            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm">
              <div className="flex items-center gap-2"><Landmark className="text-[#0f6b57]" size={20} /><h2 className="font-semibold">Nova conta financeira</h2></div>
              <div className="mt-4 grid gap-3">
                <label className="grid min-w-0 gap-2 text-sm font-medium">Usuario<select className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" value={selectedUserId} onChange={(event) => setSelectedUserId(event.target.value)}>{users.map((user) => <option key={user.id} value={user.id}>{user.name} - {user.email}</option>)}</select></label>
                <Field label="Nome da conta" value={accountName} onChange={setAccountName} />
                <Field label="Instituicao" value={institution} onChange={setInstitution} />
                <Field label="Saldo inicial" value={openingBalance} onChange={setOpeningBalance} inputMode="decimal" />
                <button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white disabled:opacity-60" disabled={pending || !selectedUserId} onClick={() => void createAccount()} type="button">Criar conta</button>
              </div>
            </section>
          </aside>
        </div>
      )}
      <MobileAppNav active="settings" />
    </main>
  );
}

function Field({ label, value, onChange, type = "text", inputMode }: { label: string; value: string; onChange: (value: string) => void; type?: string; inputMode?: "decimal" }) {
  return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" type={type} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}
