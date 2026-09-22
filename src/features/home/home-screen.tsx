"use client";

import { ArrowDownUp, BarChart3, Plus, ReceiptText } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, messageFromError, monthRange, todayISO } from "@/shared/api/client";
import type { Account, Balances, ProjectionPoint, SpendingReport, Transaction, User } from "@/shared/api/types";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";
import { MobileAppNav } from "@/shared/ui/app-navigation";
import { ErrorPanel, LoadingPanel, PageHeader } from "@/shared/ui/page-header";

type HomeData = {
  user: User;
  accounts: Account[];
  balances: Balances;
  transactions: Transaction[];
  spending: SpendingReport;
  projections: ProjectionPoint[];
};

const quickActions = [
  { label: "Adicionar", icon: Plus, href: "/add" },
  { label: "Transferir", icon: ArrowDownUp, href: "/accounts" },
  { label: "Pagar", icon: ReceiptText, href: "/debts" },
  { label: "Projetar", icon: BarChart3, href: "/reports" }
];

export function HomeScreen() {
  const router = useRouter();
  const [data, setData] = useState<HomeData | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const range = monthRange();
      const [user, accountResponse, balances, transactionResponse, spending, projectionResponse] = await Promise.all([
        apiRequest<User>("/me"),
        apiRequest<{ items: Account[] }>("/accounts"),
        apiRequest<Balances>("/balances"),
        apiRequest<{ items: Transaction[] }>("/transactions?limit=5"),
        apiRequest<SpendingReport>("/reports/spending?from=" + range.from + "&to=" + range.to),
        apiRequest<{ points: ProjectionPoint[] }>("/reports/projections", {
          method: "POST",
          body: JSON.stringify({ baseDate: todayISO(), months: 4 })
        })
      ]);
      setData({
        user,
        accounts: accountResponse.items,
        balances,
        transactions: transactionResponse.items,
        spending,
        projections: projectionResponse.points
      });
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.replace("/login");
        return;
      }
      setError(messageFromError(requestError));
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const balanceByAccount = useMemo(
    () => new Map(data?.balances.accounts.map((item) => [item.accountId, item.amountCents]) ?? []),
    [data]
  );

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 lg:px-8 lg:pb-8">
      <PageHeader title="Inicio" active="home" />
      {error && <ErrorPanel message={error} retry={() => void load()} />}
      {!data && !error && <LoadingPanel />}
      {data && (
        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)] xl:gap-6">
          <section className="overflow-hidden rounded-lg bg-[#0f3d35] text-white shadow-[0_20px_60px_rgba(23,33,29,0.16)] lg:sticky lg:top-24 lg:min-h-[560px]">
            <div className="flex h-full flex-col justify-between gap-8 p-5 sm:p-6 lg:p-7">
              <div>
                <p className="mb-3 text-sm font-medium text-white/70">Saldo consolidado</p>
                <h2 className="break-words text-4xl font-semibold leading-tight sm:text-5xl">{formatCurrency(data.balances.totalAmountCents)}</h2>
                <span className="mt-3 block text-sm text-white/68">Contas cadastradas: {data.balances.accountCount}</span>
              </div>
              <div className="grid gap-3">
                <Metric label="Gastos no mes" value={formatCurrency(data.spending.totalAmountCents)} />
                <Metric label="Titular" value={data.user.name} />
              </div>
              <p className="text-sm leading-6 text-white/72">
                Saldos confirmados pelo backend. Transferencias entre suas contas nao alteram este total.
              </p>
            </div>
          </section>

          <div className="grid min-w-0 gap-4 xl:gap-5">
            <nav className="grid grid-cols-4 gap-2 rounded-lg border border-[#dde4df] bg-white/80 p-2 shadow-sm" aria-label="Acoes rapidas">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <a className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-lg text-xs font-semibold hover:bg-[#f0f7f2] sm:min-h-20 sm:text-sm lg:flex-row" href={action.href} key={action.label}>
                    <Icon size={20} aria-hidden="true" />
                    {action.label}
                  </a>
                );
              })}
            </nav>

            <div className="grid gap-4 xl:grid-cols-2">
              <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div><h2 className="text-lg font-semibold">Contas recentes</h2><p className="mt-1 text-sm text-[#66746e]">Saldos atuais por conta</p></div>
                  <a className="text-sm font-semibold text-[#0f6b57]" href="/accounts">Ver todas</a>
                </div>
                <div className="grid gap-2">
                  {data.accounts.slice(0, 4).map((account) => (
                    <article className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-3" key={account.id}>
                      <div className="grid size-11 place-items-center rounded-lg text-sm font-bold text-white" style={{ background: account.color ?? "#0f6b57" }}>{account.name.slice(0, 1)}</div>
                      <div className="min-w-0"><strong className="block truncate">{account.name}</strong><span className="block truncate text-sm text-[#66746e]">{account.institution ?? account.type}</span></div>
                      <strong>{formatCurrency(balanceByAccount.get(account.id) ?? 0)}</strong>
                    </article>
                  ))}
                  {data.accounts.length === 0 && <Empty text="Solicite ao administrador o cadastro da sua primeira conta." />}
                </div>
              </section>

              <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
                <h2 className="text-lg font-semibold">Movimentacoes recentes</h2>
                <p className="mt-1 text-sm text-[#66746e]">Ultimos lancamentos confirmados</p>
                <div className="mt-4 grid gap-2">
                  {data.transactions.map((item) => (
                    <article className="flex items-center justify-between gap-3 rounded-lg bg-[#fbfbf8] p-3" key={item.id}>
                      <div className="min-w-0"><strong className="block truncate">{item.description}</strong><span className="text-sm text-[#66746e]">{item.accountName} - {formatShortDate(item.occurredOn)}</span></div>
                      <strong className={item.direction === "in" ? "text-[#0f6b57]" : "text-[#b54747]"}>{item.direction === "in" ? "+" : "-"}{formatCurrency(item.amountCents)}</strong>
                    </article>
                  ))}
                  {data.transactions.length === 0 && <Empty text="Nenhuma movimentacao registrada." />}
                </div>
              </section>
            </div>

            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold">Proximos meses</h2>
              <p className="mt-1 text-sm text-[#66746e]">Saldo atual somado aos fluxos planejados</p>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {data.projections.map((point) => (
                  <article className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4" key={point.month}>
                    <strong>{point.month}</strong>
                    <span className="mt-2 block text-xl font-semibold">{formatCurrency(point.projectedBalanceCents)}</span>
                    <span className="mt-2 block text-sm text-[#66746e]">Entradas {formatCurrency(point.plannedIncomeCents)} · Saidas {formatCurrency(point.plannedOutflowCents)}</span>
                  </article>
                ))}
              </div>
            </section>
          </div>
        </div>
      )}
      <MobileAppNav active="home" />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/12 bg-white/10 p-4"><span className="block text-sm text-white/68">{label}</span><strong className="mt-1 block text-xl">{value}</strong></div>;
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-lg border border-dashed border-[#ccd6d0] p-5 text-center text-sm text-[#66746e]">{text}</p>;
}
