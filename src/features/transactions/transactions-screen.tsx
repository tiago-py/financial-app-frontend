"use client";

import { Bell, Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { accounts, baseDate } from "@/features/home/mock";
import { DesktopAppNav, MobileAppNav } from "@/shared/ui/app-navigation";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";

const transactions = [
  { id: "tx-001", kind: "Despesa", title: "Mercado", accountId: "nubank", date: "2026-09-14", amountCents: -28640 },
  { id: "tx-002", kind: "Receita", title: "Salario", accountId: "itau", date: "2026-09-05", amountCents: 600000 },
  { id: "tx-003", kind: "Pagamento", title: "Aluguel", accountId: "itau", date: "2026-09-05", amountCents: -235000 },
  { id: "tx-004", kind: "Transferencia", title: "Reserva mensal", accountId: "inter", date: "2026-09-03", amountCents: 75000 }
];

const incomeCents = transactions.filter((item) => item.amountCents > 0).reduce((total, item) => total + item.amountCents, 0);
const outcomeCents = transactions.filter((item) => item.amountCents < 0).reduce((total, item) => total + Math.abs(item.amountCents), 0);

export function TransactionsScreen() {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("Todos");
  const filtered = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesKind = kind === "Todos" || transaction.kind === kind;
      const matchesQuery = transaction.title.toLowerCase().includes(query.toLowerCase());
      return matchesKind && matchesQuery;
    });
  }, [kind, query]);
  const visibleIncomeCents = filtered.filter((item) => item.amountCents > 0).reduce((total, item) => total + item.amountCents, 0);
  const visibleOutcomeCents = filtered.filter((item) => item.amountCents < 0).reduce((total, item) => total + Math.abs(item.amountCents), 0);

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 md:pb-8 lg:px-8">
      <Header title="Extrato" active="transactions" />

      <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-lg bg-[#0f3d35] p-5 text-white shadow-[0_20px_60px_rgba(23,33,29,0.16)]">
            <p className="text-sm text-white/70">Resultado do periodo</p>
            <strong className="mt-2 block text-4xl font-semibold">{formatCurrency(visibleIncomeCents - visibleOutcomeCents)}</strong>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Metric label="Entradas" value={formatCurrency(visibleIncomeCents)} />
              <Metric label="Saidas" value={formatCurrency(visibleOutcomeCents)} />
            </div>
          </div>
          <div className="rounded-lg border border-[#dde4df] bg-white/82 p-4">
            <h2 className="font-semibold">Filtros</h2>
            <div className="mt-3 grid gap-2 text-sm text-[#66746e]">
              <label className="flex min-h-11 items-center gap-2 rounded-lg bg-[#fbfbf8] px-3"><Search size={16} /><input className="min-w-0 flex-1 bg-transparent outline-none" placeholder="Buscar lancamento" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
              <label className="flex min-h-11 items-center gap-2 rounded-lg bg-[#fbfbf8] px-3"><Filter size={16} /><select className="min-w-0 flex-1 bg-transparent outline-none" value={kind} onChange={(event) => setKind(event.target.value)}>{["Todos", "Despesa", "Receita", "Pagamento", "Transferencia"].map((item) => <option key={item}>{item}</option>)}</select></label>
            </div>
          </div>
        </aside>

        <div className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Movimentacoes recentes</h2>
            <p className="mt-1 text-sm text-[#66746e]">Mock demonstrativo; transferencias nao entram como gasto ou receita consolidada.</p>
          </div>
          <div className="grid gap-2">
            {filtered.map((transaction) => {
              const account = accounts.find((item) => item.id === transaction.accountId);
              const isTransfer = transaction.kind === "Transferencia";
              const isPositive = transaction.amountCents > 0;

              return (
                <article className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-3" key={transaction.id}>
                  <div className="min-w-0">
                    <strong className="block truncate">{transaction.title}</strong>
                    <span className="text-sm text-[#66746e]">{transaction.kind} - {account?.bank} - {formatShortDate(transaction.date)}</span>
                  </div>
                  <strong className={isTransfer ? "text-[#335c81]" : isPositive ? "text-[#0f6b57]" : "text-[#b54747]"}>
                    {isPositive ? "+" : "-"}{formatCurrency(Math.abs(transaction.amountCents))}
                  </strong>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <MobileAppNav active="transactions" />
    </main>
  );
}

function Header({ title, active }: { title: string; active: Parameters<typeof DesktopAppNav>[0]["active"] }) {
  return (
    <header className="mb-4 flex min-h-16 items-center justify-between gap-4 md:sticky md:top-0 md:z-20 md:mb-6 md:bg-[#f6f4ef]/80 md:py-3 md:backdrop-blur-xl">
      <div><p className="mb-1 text-xs font-semibold text-[#66746e]">Hoje, {formatShortDate(baseDate)}</p><h1 className="text-2xl font-semibold md:text-3xl">{title}</h1></div>
      <DesktopAppNav active={active} />
      <button className="grid size-11 place-items-center rounded-lg border border-[#dde4df] bg-white/80 shadow-sm" type="button" aria-label="Notificacoes"><Bell size={20} /></button>
    </header>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/12 bg-white/10 p-3"><span className="block text-sm text-white/68">{label}</span><strong className="mt-1 block truncate">{value}</strong></div>;
}
