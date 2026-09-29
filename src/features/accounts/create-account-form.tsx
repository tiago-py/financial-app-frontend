"use client";

import { useRef, useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, messageFromError, todayISO } from "@/shared/api/client";
import { parseOpeningBalance } from "./parse-opening-balance";

export function CreateAccountForm({ onCreated }: { onCreated: () => Promise<void> }) {
  const router = useRouter();
  const submitting = useRef(false);
  const [name, setName] = useState("");
  const [institution, setInstitution] = useState("");
  const [type, setType] = useState("checking");
  const [balance, setBalance] = useState("0,00");
  const [openedOn, setOpenedOn] = useState(todayISO);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputClass = "min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting.current) return;
    setError(""); setSuccess("");
    const openingBalanceCents = parseOpeningBalance(balance);
    if (!name.trim()) { setError("Informe o nome da conta."); return; }
    if (openingBalanceCents === null) { setError("Informe um saldo válido, como 1.250,50 ou -100,00."); return; }
    submitting.current = true;
    setPending(true);
    try {
      await apiRequest("/accounts", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), institution: institution.trim(), type, openingBalanceCents, openedOn, color: "#0f6b57" })
      });
      setName(""); setInstitution(""); setType("checking"); setBalance("0,00"); setOpenedOn(todayISO());
      setSuccess("Conta adicionada com sucesso.");
      await onCreated();
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) { router.replace("/login"); return; }
      setError(requestError instanceof ApiError && requestError.fieldErrors.length
        ? requestError.fieldErrors.map((field) => field.message).join(". ")
        : messageFromError(requestError));
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return <section className="mb-4 rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
    <div className="flex items-center gap-2"><Plus size={20} className="text-[#0f6b57]" /><h2 className="text-lg font-semibold">Adicionar conta</h2></div>
    <p className="mt-2 text-sm text-[#66746e]">Cadastre uma conta bancária ou carteira para organizar seu saldo.</p>
    {error && <p role="alert" className="mt-3 rounded-lg bg-[#fff5f3] p-3 text-sm text-[#a43b32]">{error}</p>}
    {success && <p role="status" className="mt-3 text-sm text-[#0f6b57]">{success}</p>}
    <form onSubmit={submit} className="mt-4">
      <fieldset disabled={pending} className="grid min-w-0 gap-3 border-0 p-0 sm:grid-cols-2 lg:grid-cols-3">
        <label className="grid min-w-0 gap-2 text-sm font-medium">Nome da conta<input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} required maxLength={120} placeholder="Minha conta principal" /></label>
        <label className="grid min-w-0 gap-2 text-sm font-medium">Banco ou instituição (opcional)<input className={inputClass} value={institution} onChange={(e) => setInstitution(e.target.value)} maxLength={120} placeholder="Nome do banco" /></label>
        <label className="grid min-w-0 gap-2 text-sm font-medium">Tipo<select className={inputClass} value={type} onChange={(e) => setType(e.target.value)}><option value="checking">Conta corrente</option><option value="savings">Poupança</option><option value="wallet">Carteira</option><option value="investment">Investimento</option><option value="other">Outra</option></select></label>
        <label className="grid min-w-0 gap-2 text-sm font-medium">Saldo inicial (R$)<input className={inputClass} inputMode="decimal" value={balance} onChange={(e) => setBalance(e.target.value)} required aria-describedby="opening-balance-help" /></label>
        <label className="grid min-w-0 gap-2 text-sm font-medium">Data do saldo inicial<input type="date" className={inputClass} value={openedOn} onChange={(e) => setOpenedOn(e.target.value)} required /></label>
        <button type="submit" disabled={pending} className="min-h-11 self-end rounded-lg bg-[#0f6b57] px-4 font-semibold text-white disabled:opacity-60">{pending ? "Adicionando..." : "Adicionar conta"}</button>
      </fieldset>
      <p id="opening-balance-help" className="mt-3 text-xs text-[#66746e]">Use vírgula para centavos. O saldo inicial pode ser zero ou negativo.</p>
    </form>
  </section>;
}
