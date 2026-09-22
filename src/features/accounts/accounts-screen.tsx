"use client";

import { Archive, ArrowRight, Landmark } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, centsFromInput, idempotencyKey, messageFromError, todayISO } from "@/shared/api/client";
import type { Account, Balances, Transfer } from "@/shared/api/types";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";
import { MobileAppNav } from "@/shared/ui/app-navigation";
import { ErrorPanel, LoadingPanel, PageHeader } from "@/shared/ui/page-header";

export function AccountsScreen() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [balances, setBalances] = useState<Balances | null>(null);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [tab, setTab] = useState<"accounts" | "transfers">("accounts");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [fromId, setFromId] = useState("");
  const [toId, setToId] = useState("");
  const [transferAmount, setTransferAmount] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [accountResponse, balanceResponse, transferResponse] = await Promise.all([
        apiRequest<{ items: Account[] }>("/accounts"),
        apiRequest<Balances>("/balances"),
        apiRequest<{ items: Transfer[] }>("/transfers")
      ]);
      setAccounts(accountResponse.items);
      setBalances(balanceResponse);
      setTransfers(transferResponse.items);
      setFromId((current) => current || accountResponse.items[0]?.id || "");
      setToId((current) => current || accountResponse.items[1]?.id || "");
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

  const balanceMap = useMemo(
    () => new Map(balances?.accounts.map((item) => [item.accountId, item.amountCents]) ?? []),
    [balances]
  );

  async function archiveAccount(id: string) {
    if (!window.confirm("Arquivar esta conta? O historico sera preservado.")) return;
    try {
      await apiRequest("/accounts/" + id, { method: "DELETE" });
      await load();
    } catch (requestError) {
      setError(messageFromError(requestError));
    }
  }

  async function createTransfer() {
    const amountCents = centsFromInput(transferAmount);
    if (!fromId || !toId || fromId === toId || amountCents <= 0) return;
    setPending(true);
    try {
      await apiRequest("/transfers", {
        method: "POST",
        headers: { "Idempotency-Key": idempotencyKey() },
        body: JSON.stringify({
          fromAccountId: fromId,
          toAccountId: toId,
          amountCents,
          occurredOn: todayISO(),
          description: "Transferencia entre contas"
        })
      });
      setTransferAmount("");
      await load();
    } catch (requestError) {
      setError(messageFromError(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 lg:px-8 lg:pb-8">
      <PageHeader title="Contas" active="accounts" />
      {error && <ErrorPanel message={error} />}
      {loading && <LoadingPanel />}
      {!loading && balances && (
        <>
          <section className="mb-4 grid gap-3 sm:grid-cols-3">
            <Metric label="Saldo consolidado" value={formatCurrency(balances.totalAmountCents)} />
            <Metric label="Contas ativas" value={String(balances.accountCount)} />
            <Metric label="Maior saldo" value={formatCurrency(Math.max(0, ...balances.accounts.map((item) => item.amountCents)))} />
          </section>

          <div className="mb-4 grid grid-cols-2 gap-1 rounded-lg bg-[#e8eee9] p-1 sm:w-80">
            <Tab active={tab === "accounts"} onClick={() => setTab("accounts")}>Contas</Tab>
            <Tab active={tab === "transfers"} onClick={() => setTab("transfers")}>Transferencias</Tab>
          </div>

          {tab === "accounts" ? (
            <div>
              <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm">
                <h2 className="text-lg font-semibold">Contas cadastradas</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {accounts.map((account) => (
                    <article className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4" key={account.id}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="grid size-11 place-items-center rounded-lg bg-[#0f6b57] text-white"><Landmark size={20} /></span>
                          <div className="min-w-0"><strong className="block truncate">{account.name}</strong><span className="block truncate text-sm text-[#66746e]">{account.institution ?? account.type}</span></div>
                        </div>
                        <button className="grid size-10 place-items-center rounded-lg text-[#a43b32] hover:bg-[#a43b32]/10" onClick={() => void archiveAccount(account.id)} title="Arquivar conta" type="button"><Archive size={18} /></button>
                      </div>
                      <strong className="mt-5 block text-2xl">{formatCurrency(balanceMap.get(account.id) ?? 0)}</strong>
                      <span className="mt-1 block text-sm text-[#66746e]">Aberta em {formatShortDate(account.openedOn)}</span>
                    </article>
                  ))}
                  {accounts.length === 0 && <p className="text-sm text-[#66746e]">Nenhuma conta cadastrada.</p>}
                </div>
              </section>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)]">
              <section className="h-fit rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm">
                <h2 className="font-semibold">Nova transferencia</h2>
                <div className="mt-4 grid gap-3">
                  <SelectAccount label="Origem" value={fromId} accounts={accounts} onChange={setFromId} />
                  <SelectAccount label="Destino" value={toId} accounts={accounts} onChange={setToId} />
                  <Field label="Valor" value={transferAmount} onChange={setTransferAmount} inputMode="decimal" />
                  <button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white disabled:opacity-60" disabled={pending || accounts.length < 2} onClick={() => void createTransfer()} type="button">Transferir</button>
                </div>
              </section>
              <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm">
                <h2 className="font-semibold">Historico de transferencias</h2>
                <div className="mt-4 grid gap-2">
                  {transfers.map((transfer) => (
                    <article className="flex min-w-0 flex-col gap-2 rounded-lg bg-[#fbfbf8] p-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3" key={transfer.id}>
                      <div className="flex min-w-0 items-center gap-3"><ArrowRight className="shrink-0" size={18} /><div className="min-w-0"><strong className="block truncate">{accountName(accounts, transfer.fromAccountId)} para {accountName(accounts, transfer.toAccountId)}</strong><span className="text-sm text-[#66746e]">{formatShortDate(transfer.occurredOn)}{transfer.reversedAt ? " · Estornada" : ""}</span></div></div>
                      <strong className="whitespace-nowrap pl-7 sm:pl-0">{formatCurrency(transfer.amountCents)}</strong>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          )}
        </>
      )}
      <MobileAppNav active="accounts" />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-lg border border-[#dde4df] bg-white/82 p-4"><span className="text-sm text-[#66746e]">{label}</span><strong className="mt-1 block text-2xl">{value}</strong></article>;
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return <button className={active ? "min-h-10 rounded-lg bg-white text-sm font-semibold shadow-sm" : "min-h-10 rounded-lg text-sm font-semibold text-[#66746e]"} onClick={onClick} type="button">{children}</button>;
}

function Field({ label, value, onChange, inputMode }: { label: string; value: string; onChange: (value: string) => void; inputMode?: "decimal" }) {
  return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<input className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} /></label>;
}

function SelectAccount({ label, value, accounts, onChange }: { label: string; value: string; accounts: Account[]; onChange: (value: string) => void }) {
  return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}<select className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3" value={value} onChange={(event) => onChange(event.target.value)}>{accounts.map((account) => <option value={account.id} key={account.id}>{account.name}</option>)}</select></label>;
}

function accountName(accounts: Account[], id: string) {
  return accounts.find((account) => account.id === id)?.name ?? "Conta";
}
