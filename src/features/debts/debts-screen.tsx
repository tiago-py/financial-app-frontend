"use client";

import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, centsFromInput, idempotencyKey, messageFromError, todayISO } from "@/shared/api/client";
import type { Account, Debt } from "@/shared/api/types";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";
import { MobileAppNav } from "@/shared/ui/app-navigation";
import { ErrorPanel, LoadingPanel, PageHeader } from "@/shared/ui/page-header";

export function DebtsScreen() {
  const router = useRouter();
  const [debts, setDebts] = useState<Debt[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [payment, setPayment] = useState("");
  const [description, setDescription] = useState("");
  const [creditor, setCreditor] = useState("");
  const [principal, setPrincipal] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [installmentCount, setInstallmentCount] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [debtResponse, accountResponse] = await Promise.all([
        apiRequest<{ items: Debt[] }>("/debts"),
        apiRequest<{ items: Account[] }>("/accounts")
      ]);
      setDebts(debtResponse.items);
      setAccounts(accountResponse.items);
      setSelectedDebtId((current) => current || debtResponse.items.find((item) => item.status === "active")?.id || "");
      setAccountId((current) => current || accountResponse.items[0]?.id || "");
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.replace("/login");
        return;
      }
      setError(messageFromError(requestError));
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { void load(); }, [load]);

  async function createDebt() {
    const principalCents = centsFromInput(principal);
    const installments = Number(installmentCount);
    if (!description.trim() || principalCents <= 0 || !Number.isInteger(installments) || installments < 1 || installments > 360 || (installments > 1 && !dueDate)) return;
    setPending(true);
    try {
      await apiRequest("/debts", {
        method: "POST",
        body: JSON.stringify({ description, creditor, principalCents, dueDate: dueDate || null, installmentCount: installments })
      });
      setDescription(""); setCreditor(""); setPrincipal(""); setDueDate(""); setInstallmentCount("1");
      await load();
    } catch (requestError) {
      setError(messageFromError(requestError));
    } finally { setPending(false); }
  }

  async function payDebt() {
    const amountCents = centsFromInput(payment);
    if (!selectedDebtId || !accountId || amountCents <= 0) return;
    setPending(true);
    try {
      await apiRequest("/debts/" + selectedDebtId + "/payments", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey() },
        body: JSON.stringify({ accountId, amountCents, paidOn: todayISO() })
      });
      setPayment("");
      await load();
    } catch (requestError) {
      setError(messageFromError(requestError));
    } finally { setPending(false); }
  }

  async function removeDebt(id: string) {
    if (!window.confirm("Excluir esta divida sem pagamentos?")) return;
    try {
      await apiRequest("/debts/" + id, { method: "DELETE" });
      await load();
    } catch (requestError) { setError(messageFromError(requestError)); }
  }

  const pendingTotal = debts.reduce((sum, item) => sum + item.pendingCents, 0);
  const activeDebts = debts.filter((item) => item.status === "active");

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 lg:px-8 lg:pb-8">
      <PageHeader title="Dividas" active="debts" />
      {error && <ErrorPanel message={error} />}
      {loading && <LoadingPanel />}
      {!loading && (
        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
            <section className="min-w-0 rounded-lg bg-[#0f3d35] p-5 text-white"><p className="text-sm text-white/70">Pendente em dividas</p><strong className="mt-2 block break-words text-3xl sm:text-4xl">{formatCurrency(pendingTotal)}</strong></section>
            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4">
              <h2 className="font-semibold">Registrar pagamento</h2>
              <div className="mt-3 grid gap-3">
                <Select label="Divida" value={selectedDebtId} onChange={setSelectedDebtId} options={activeDebts.map((item) => ({ id: item.id, label: item.description }))} />
                <Select label="Conta" value={accountId} onChange={setAccountId} options={accounts.map((item) => ({ id: item.id, label: item.name }))} />
                <Field label="Valor" value={payment} onChange={setPayment} />
                <button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white disabled:opacity-60" disabled={pending || !selectedDebtId} onClick={() => void payDebt()} type="button">Confirmar pagamento</button>
              </div>
            </section>
          </aside>
          <div className="grid gap-4">
            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold">Dividas cadastradas</h2>
              <div className="mt-4 grid gap-3">
                {debts.map((debt) => {
                  const progress = debt.principalCents ? (debt.paidCents / debt.principalCents) * 100 : 0;
                  return <article className="min-w-0 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4" key={debt.id}><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div className="min-w-0"><strong className="block break-words">{debt.description}</strong><span className="block break-words text-sm text-[#66746e]">{debt.creditor ?? "Sem credor"}{debt.dueDate ? " · vence " + formatShortDate(debt.dueDate) : ""}{debt.installmentCount > 1 ? ` · ${debt.installmentCount} parcelas` : ""}</span></div><div className="flex items-center justify-between gap-2 sm:justify-end"><strong className="whitespace-nowrap">{formatCurrency(debt.pendingCents)}</strong>{debt.paidCents === 0 && <button className="grid size-9 shrink-0 place-items-center rounded-lg text-[#a43b32] hover:bg-[#a43b32]/10" onClick={() => void removeDebt(debt.id)} title="Excluir divida" type="button"><Trash2 size={17} /></button>}</div></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5ece7]"><i className="block h-full rounded-full bg-[#0f6b57]" style={{ width: Math.min(100, progress) + "%" }} /></div><div className="mt-2 flex flex-wrap justify-between gap-2 text-sm text-[#66746e]"><span>Pago {formatCurrency(debt.paidCents)}</span><span>{debt.status}</span></div></article>;
                })}
              </div>
            </section>
            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
              <div className="flex items-center gap-2"><Plus size={20} className="text-[#0f6b57]" /><h2 className="font-semibold">Nova divida</h2></div>
              <div className="mt-4 grid min-w-0 gap-3 md:grid-cols-2"><TextField label="Descricao" value={description} onChange={setDescription} /><TextField label="Credor" value={creditor} onChange={setCreditor} /><Field label="Valor principal" value={principal} onChange={setPrincipal} /><label className="grid min-w-0 gap-2 text-sm font-medium">Numero de parcelas<input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" min="1" max="360" type="number" value={installmentCount} onChange={(event) => setInstallmentCount(event.target.value)} /></label><label className="grid min-w-0 gap-2 text-sm font-medium">{Number(installmentCount) > 1 ? "Vencimento da primeira parcela" : "Vencimento"}<input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" type="date" value={dueDate} onChange={(event) => setDueDate(event.target.value)} /></label><button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white disabled:opacity-60 md:col-span-2" disabled={pending} onClick={() => void createDebt()} type="button">Cadastrar divida</button></div>
            </section>
          </div>
        </div>
      )}
      <MobileAppNav active="debts" />
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" value={value} onChange={(event) => onChange(event.target.value)} /></label>; }
function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ id: string; label: string }> }) { return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<select className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>; }
