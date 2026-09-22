"use client";

import { Filter, RotateCcw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, messageFromError, todayISO } from "@/shared/api/client";
import type { Transaction } from "@/shared/api/types";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";
import { MobileAppNav } from "@/shared/ui/app-navigation";
import { ErrorPanel, LoadingPanel, PageHeader } from "@/shared/ui/page-header";

const kindLabels: Record<Transaction["kind"], string> = {
  income: "Receita",
  expense: "Despesa",
  transfer: "Transferencia",
  debt_payment: "Pagamento",
  reversal: "Estorno"
};

export function TransactionsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<Transaction[]>([]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError("");
    try {
      const suffix = kind ? "?limit=100&type=" + kind : "?limit=100";
      const response = await apiRequest<{ items: Transaction[] }>("/transactions" + suffix);
      setItems(response.items);
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.replace("/login");
        return;
      }
      setError(messageFromError(requestError));
    } finally {
      setLoading(false);
    }
  }, [kind, router]);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(
    () => items.filter((item) => item.description.toLowerCase().includes(query.toLowerCase())),
    [items, query]
  );
  const income = filtered.filter((item) => item.kind !== "transfer" && item.direction === "in").reduce((sum, item) => sum + item.amountCents, 0);
  const outcome = filtered.filter((item) => item.kind !== "transfer" && item.direction === "out").reduce((sum, item) => sum + item.amountCents, 0);

  async function reverse(item: Transaction) {
    if (item.kind !== "income" && item.kind !== "expense") return;
    if (!window.confirm("Estornar este lancamento?")) return;
    try {
      await apiRequest("/transactions/" + item.id + "/reversals", {
        method: "POST",
        body: JSON.stringify({ reason: "Estorno solicitado pelo usuario", occurredOn: todayISO() })
      });
      await load();
    } catch (requestError) {
      setError(messageFromError(requestError));
    }
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 lg:px-8 lg:pb-8">
      <PageHeader title="Extrato" active="transactions" />
      {error && <ErrorPanel message={error} retry={() => void load()} />}
      {loading && <LoadingPanel />}
      {!loading && (
        <section className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
            <div className="rounded-lg bg-[#0f3d35] p-5 text-white">
              <p className="text-sm text-white/70">Resultado exibido</p>
              <strong className="mt-2 block break-words text-3xl sm:text-4xl">{formatCurrency(income - outcome)}</strong>
              <div className="mt-5 grid grid-cols-2 gap-3"><Metric label="Entradas" value={formatCurrency(income)} /><Metric label="Saidas" value={formatCurrency(outcome)} /></div>
            </div>
            <div className="rounded-lg border border-[#dde4df] bg-white/82 p-4">
              <h2 className="font-semibold">Filtros</h2>
              <label className="mt-3 flex min-h-11 items-center gap-2 rounded-lg bg-[#fbfbf8] px-3"><Search size={16} /><input className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Buscar descricao" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
              <label className="mt-2 flex min-h-11 items-center gap-2 rounded-lg bg-[#fbfbf8] px-3"><Filter size={16} /><select className="min-w-0 flex-1 bg-transparent text-sm outline-none" value={kind} onChange={(event) => setKind(event.target.value)}><option value="">Todos os tipos</option>{Object.entries(kindLabels).map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
            </div>
          </aside>
          <div className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold">Movimentacoes</h2>
            <p className="mt-1 text-sm text-[#66746e]">{filtered.length} lancamentos encontrados</p>
            <div className="mt-4 grid gap-2">
              {filtered.map((item) => (
                <article className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-3" key={item.id}>
                  <div className="min-w-0"><strong className="block truncate">{item.description}</strong><span className="block truncate text-sm text-[#66746e]">{kindLabels[item.kind]} · {item.accountName} · {formatShortDate(item.occurredOn)}</span></div>
                  <div className="flex items-center gap-1 sm:gap-2"><strong className={item.kind === "transfer" ? "whitespace-nowrap text-[#335c81]" : item.direction === "in" ? "whitespace-nowrap text-[#0f6b57]" : "whitespace-nowrap text-[#b54747]"}>{item.direction === "in" ? "+" : "-"}{formatCurrency(item.amountCents)}</strong>
                  {(item.kind === "income" || item.kind === "expense") ? <button className="grid size-10 shrink-0 place-items-center rounded-lg text-[#66746e] hover:bg-[#e7ece8]" onClick={() => void reverse(item)} title="Estornar" type="button"><RotateCcw size={17} /></button> : null}</div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
      <MobileAppNav active="transactions" />
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-lg border border-white/12 bg-white/10 p-3"><span className="text-sm text-white/68">{label}</span><strong className="mt-1 block truncate">{value}</strong></div>;
}
