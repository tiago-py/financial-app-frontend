"use client";

import { Download, PieChart, TrendingDown, TrendingUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, apiRequest, messageFromError, monthRange, todayISO } from "@/shared/api/client";
import type { ProjectionPoint, SpendingReport } from "@/shared/api/types";
import { formatCurrency } from "@/shared/lib/format";
import { MobileAppNav } from "@/shared/ui/app-navigation";
import { ErrorPanel, LoadingPanel, PageHeader } from "@/shared/ui/page-header";

type ReportData = {
  spending: SpendingReport;
  averageAmountCents: number;
  monthsConsidered: number;
  projections: ProjectionPoint[];
};

export function ReportsScreen() {
  const router = useRouter();
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState<"month" | "year">("month");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    const current = monthRange();
    const from = period === "month" ? current.from : todayISO().slice(0, 4) + "-01-01";
    try {
      const [spending, average, projection] = await Promise.all([
        apiRequest<SpendingReport>("/reports/spending?from=" + from + "&to=" + current.to),
        apiRequest<{ averageAmountCents: number; monthsConsidered: number }>("/reports/monthly-average?from=" + from + "&to=" + current.to),
        apiRequest<{ points: ProjectionPoint[] }>("/reports/projections", {
          method: "POST",
          body: JSON.stringify({ baseDate: todayISO(), months: 6 })
        })
      ]);
      setData({ spending, averageAmountCents: average.averageAmountCents, monthsConsidered: average.monthsConsidered, projections: projection.points });
    } catch (requestError) {
      if (requestError instanceof ApiError && requestError.status === 401) {
        router.replace("/login");
        return;
      }
      setError(messageFromError(requestError));
    }
  }, [period, router]);

  useEffect(() => { void load(); }, [load]);

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 lg:px-8 lg:pb-8">
      <PageHeader title="Relatorios" active="reports" />
      {error && <ErrorPanel message={error} retry={() => void load()} />}
      {!data && !error && <LoadingPanel />}
      {data && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-4">
            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div><h2 className="text-lg font-semibold">Gastos por categoria</h2><p className="mt-1 text-sm text-[#66746e]">Pagamentos entram uma vez; transferencias ficam de fora.</p></div>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-[#edf2ee] p-1"><Period active={period === "month"} onClick={() => setPeriod("month")}>Mes</Period><Period active={period === "year"} onClick={() => setPeriod("year")}>Ano</Period></div>
              </div>
              <div className="mt-5 grid gap-4">
                {data.spending.byCategory.map((category, index) => {
                  const width = data.spending.totalAmountCents === 0 ? 0 : Math.max(0, category.amountCents / data.spending.totalAmountCents * 100);
                  const colors = ["#0f6b57", "#335c81", "#bb7b22", "#b54747"];
                  return <div key={category.categoryId ?? category.categoryName}><div className="mb-1 flex justify-between gap-3 text-sm"><span>{category.categoryName}</span><strong>{formatCurrency(category.amountCents)}</strong></div><div className="h-3 overflow-hidden rounded-full bg-[#e5ece7]"><i className="block h-full rounded-full" style={{ width: width + "%", background: colors[index % colors.length] }} /></div></div>;
                })}
                {data.spending.byCategory.length === 0 && <p className="text-sm text-[#66746e]">Ainda nao existem gastos neste periodo.</p>}
              </div>
            </section>
            <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
              <h2 className="text-lg font-semibold">Projecao de saldo</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {data.projections.map((point) => <article className="rounded-lg bg-[#fbfbf8] p-4" key={point.month}><span className="text-sm text-[#66746e]">{point.month}</span><strong className="mt-1 block text-xl">{formatCurrency(point.projectedBalanceCents)}</strong><span className="mt-2 block text-xs text-[#66746e]">+{formatCurrency(point.plannedIncomeCents)} · -{formatCurrency(point.plannedOutflowCents)}</span></article>)}
              </div>
            </section>
          </div>
          <aside className="grid h-fit gap-4 lg:sticky lg:top-24">
            <Metric icon={PieChart} label="Total do periodo" value={formatCurrency(data.spending.totalAmountCents)} />
            <Metric icon={TrendingUp} label={"Media em " + data.monthsConsidered + " mes(es)"} value={formatCurrency(data.averageAmountCents)} />
            <Metric icon={TrendingDown} label="Menor projecao" value={formatCurrency(Math.min(...data.projections.map((item) => item.projectedBalanceCents)))} />
            <a className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white" href={"/api/backend/exports/transactions?from=" + data.spending.from + "&to=" + data.spending.to} download><Download size={18} />Exportar CSV</a>
          </aside>
        </div>
      )}
      <MobileAppNav active="reports" />
    </main>
  );
}

function Period({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) { return <button className={active ? "min-h-9 rounded-lg bg-white px-4 text-sm font-semibold shadow-sm" : "min-h-9 rounded-lg px-4 text-sm font-semibold text-[#66746e]"} onClick={onClick} type="button">{children}</button>; }
function Metric({ icon: Icon, label, value }: { icon: typeof PieChart; label: string; value: string }) { return <article className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm"><Icon className="text-[#0f6b57]" size={22} /><span className="mt-4 block text-sm text-[#66746e]">{label}</span><strong className="mt-1 block text-2xl">{value}</strong></article>; }
