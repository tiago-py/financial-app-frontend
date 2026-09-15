"use client";

import { Bell, PieChart, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";
import { baseDate, projections } from "@/features/home/mock";
import { DesktopAppNav, MobileAppNav } from "@/shared/ui/app-navigation";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";

const categories = [
  { name: "Moradia", amountCents: 235000, color: "#0f6b57" },
  { name: "Alimentacao", amountCents: 128600, color: "#335c81" },
  { name: "Transporte", amountCents: 64200, color: "#bb7b22" },
  { name: "Assinaturas", amountCents: 31800, color: "#b54747" }
];

const total = categories.reduce((sum, item) => sum + item.amountCents, 0);

export function ReportsScreen() {
  const [period, setPeriod] = useState("Mes");
  const multiplier = period === "Semana" ? 0.32 : period === "Ano" ? 5.8 : 1;
  const visibleCategories = useMemo(
    () => categories.map((category) => ({ ...category, amountCents: Math.round(category.amountCents * multiplier) })),
    [multiplier]
  );
  const visibleTotal = visibleCategories.reduce((sum, item) => sum + item.amountCents, 0);

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 md:pb-8 lg:px-8">
      <Header />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Gastos por categoria</h2>
            <p className="mt-1 text-sm text-[#66746e]">Valores acessiveis do mock, sem grafico dependente apenas de cor.</p>
          </div>
          <div className="mb-4 grid grid-cols-3 gap-2 rounded-lg bg-[#f0f4ef] p-1">
            {["Semana", "Mes", "Ano"].map((item) => (
              <button className={period === item ? "min-h-10 rounded-lg bg-white text-sm font-semibold text-[#0f3d35] shadow-sm" : "min-h-10 rounded-lg text-sm font-semibold text-[#66746e]"} key={item} onClick={() => setPeriod(item)} type="button">{item}</button>
            ))}
          </div>
          <div className="grid gap-3">
            {visibleCategories.map((category) => (
              <div key={category.name}>
                <div className="mb-1 flex justify-between gap-3 text-sm"><span>{category.name}</span><strong>{formatCurrency(category.amountCents)}</strong></div>
                <div className="h-3 overflow-hidden rounded-full bg-[#e5ece7]"><i className="block h-full rounded-full" style={{ width: `${(category.amountCents / visibleTotal) * 100}%`, background: category.color }} /></div>
              </div>
            ))}
          </div>
        </section>
        <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
          <Metric icon={PieChart} label={`Total - ${period}`} value={formatCurrency(visibleTotal)} />
          <Metric icon={TrendingUp} label="Media simulada" value={formatCurrency(Math.round(407319 * multiplier))} />
          <Metric icon={TrendingDown} label="Menor projecao" value={formatCurrency(Math.min(...projections.map((item) => item.projectedBalanceCents)))} />
        </aside>
      </div>
      <MobileAppNav active="reports" />
    </main>
  );
}

function Header() {
  return <header className="mb-4 flex min-h-16 items-center justify-between gap-4 md:sticky md:top-0 md:z-20 md:mb-6 md:bg-[#f6f4ef]/80 md:py-3 md:backdrop-blur-xl"><div><p className="mb-1 text-xs font-semibold text-[#66746e]">Hoje, {formatShortDate(baseDate)}</p><h1 className="text-2xl font-semibold md:text-3xl">Relatorios</h1></div><DesktopAppNav active="reports" /><button className="grid size-11 place-items-center rounded-lg border border-[#dde4df] bg-white/80 shadow-sm" type="button" aria-label="Notificacoes"><Bell size={20} /></button></header>;
}

function Metric({ icon: Icon, label, value }: { icon: typeof PieChart; label: string; value: string }) {
  return <article className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm"><Icon className="text-[#0f6b57]" size={22} /><span className="mt-4 block text-sm text-[#66746e]">{label}</span><strong className="mt-1 block text-2xl font-semibold">{value}</strong></article>;
}
