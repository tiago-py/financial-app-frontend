"use client";

import { CreditCard, HandCoins, ReceiptText, Repeat } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, centsFromInput, idempotencyKey, messageFromError, todayISO } from "@/shared/api/client";
import type { Account, Category, Debt } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/format";
import { MobileAppNav } from "@/shared/ui/app-navigation";
import { ErrorPanel, LoadingPanel, PageHeader } from "@/shared/ui/page-header";

type ActionKind = "expense" | "income" | "transfer" | "payment";
const actions = [
  { id: "expense" as const, title: "Despesa", icon: CreditCard },
  { id: "income" as const, title: "Receita", icon: HandCoins },
  { id: "transfer" as const, title: "Transferencia", icon: Repeat },
  { id: "payment" as const, title: "Pagamento de divida", icon: ReceiptText }
];

export function AddScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [kind, setKind] = useState<ActionKind>("expense");
  const [accountId, setAccountId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [debtId, setDebtId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    try {
      const [accountResponse, categoryResponse, debtResponse] = await Promise.all([
        apiRequest<{ items: Account[] }>("/accounts"),
        apiRequest<{ items: Category[] }>("/categories"),
        apiRequest<{ items: Debt[] }>("/debts?status=active")
      ]);
      setAccounts(accountResponse.items);
      setCategories(categoryResponse.items);
      setDebts(debtResponse.items);
      setAccountId(accountResponse.items[0]?.id ?? "");
      setDestinationId(accountResponse.items[1]?.id ?? "");
      setDebtId(debtResponse.items[0]?.id ?? "");
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

  async function submit() {
    const amountCents = centsFromInput(amount);
    if (!accountId || amountCents <= 0) return;
    setPending(true);
    setError("");
    setSuccess("");
    try {
      if (kind === "expense" || kind === "income") {
        await apiRequest(kind === "expense" ? "/expenses" : "/incomes", {
          method: "POST",
          body: JSON.stringify({
            accountId,
            categoryId: categoryId || null,
            amountCents,
            occurredOn: todayISO(),
            description: description.trim() || (kind === "expense" ? "Despesa" : "Receita")
          })
        });
      } else if (kind === "transfer") {
        await apiRequest("/transfers", {
          method: "POST",
          headers: { "Idempotency-Key": idempotencyKey() },
          body: JSON.stringify({
            fromAccountId: accountId,
            toAccountId: destinationId,
            amountCents,
            occurredOn: todayISO(),
            description: description.trim() || "Transferencia entre contas"
          })
        });
      } else {
        await apiRequest("/debts/" + debtId + "/payments", {
          method: "POST",
          headers: { "Idempotency-Key": idempotencyKey() },
          body: JSON.stringify({ accountId, amountCents, paidOn: todayISO() })
        });
      }
      setSuccess("Operacao confirmada pelo backend.");
      setAmount("");
      setDescription("");
    } catch (requestError) {
      setError(messageFromError(requestError));
    } finally {
      setPending(false);
    }
  }

  const amountCents = centsFromInput(amount);
  const purpose = kind === "income" ? "income" : "expense";

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 lg:px-8 lg:pb-8">
      <PageHeader title="Adicionar" active="add" />
      {loading && <LoadingPanel />}
      {!loading && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,0.8fr)_minmax(420px,1.2fr)]">
          <section className="rounded-lg bg-[#0f3d35] p-5 text-white shadow-[0_20px_60px_rgba(23,33,29,0.16)] sm:p-6">
            <p className="text-sm text-white/70">Valor da operacao</p>
            <strong className="mt-2 block break-words text-4xl sm:text-5xl">{formatCurrency(amountCents)}</strong>
            <p className="mt-5 text-sm leading-6 text-white/72">A operacao so aparece nos saldos e relatorios depois da confirmacao da API.</p>
          </section>
          <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              {actions.map((action) => {
                const Icon = action.icon;
                return <button className={kind === action.id ? "min-h-24 rounded-lg border border-[#0f6b57] bg-[#f0f7f2] p-4 text-left" : "min-h-24 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4 text-left"} key={action.id} onClick={() => setKind(action.id)} type="button"><Icon className="text-[#0f6b57]" size={21} /><strong className="mt-3 block">{action.title}</strong></button>;
              })}
            </div>
            <div className="mt-4 grid gap-3 rounded-lg bg-[#fbfbf8] p-4 md:grid-cols-2">
              <Select label="Conta" value={accountId} onChange={setAccountId} options={accounts.map((item) => ({ id: item.id, label: item.name }))} />
              {kind === "transfer" && <Select label="Conta de destino" value={destinationId} onChange={setDestinationId} options={accounts.map((item) => ({ id: item.id, label: item.name }))} />}
              {kind === "payment" && <Select label="Divida" value={debtId} onChange={setDebtId} options={debts.map((item) => ({ id: item.id, label: item.description }))} />}
              {(kind === "expense" || kind === "income") && <Select label="Categoria" value={categoryId} onChange={setCategoryId} optional options={categories.filter((item) => item.purpose === purpose).map((item) => ({ id: item.id, label: item.name }))} />}
              <Field label="Valor" value={amount} onChange={setAmount} />
              {kind !== "payment" && <label className="grid min-w-0 gap-2 text-sm font-medium md:col-span-2">Descricao<input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" value={description} onChange={(event) => setDescription(event.target.value)} /></label>}
              {error && <div className="md:col-span-2"><ErrorPanel message={error} /></div>}
              {success && <p className="rounded-lg border border-[#b8d8c8] bg-[#f0f7f2] p-3 text-sm text-[#0f6b57] md:col-span-2">{success}</p>}
              <button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white disabled:opacity-60 md:col-span-2" disabled={pending || accounts.length === 0} onClick={() => void submit()} type="button">{pending ? "Confirmando..." : "Confirmar operacao"}</button>
            </div>
          </section>
        </div>
      )}
      <MobileAppNav active="add" />
    </main>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" inputMode="decimal" value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function Select({ label, value, onChange, options, optional }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ id: string; label: string }>; optional?: boolean }) {
  return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<select className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" value={value} onChange={(event) => onChange(event.target.value)}>{optional && <option value="">Sem categoria</option>}{options.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>;
}
