"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { accounts, baseDate } from "@/features/home/mock";
import { DesktopAppNav, MobileAppNav } from "@/shared/ui/app-navigation";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";

const initialDebts = [
  { id: "debt-1", creditor: "Cartao Nubank", due: "2026-09-18", principalCents: 184360, paidCents: 0 },
  { id: "debt-2", creditor: "Financiamento", due: "2026-09-25", principalCents: 1250000, paidCents: 320000 },
  { id: "debt-3", creditor: "Emprestimo familiar", due: "2026-10-10", principalCents: 420000, paidCents: 140000 }
];

export function DebtsScreen() {
  const [debts, setDebts] = useState(initialDebts);
  const [selectedDebtId, setSelectedDebtId] = useState(initialDebts[0].id);
  const [payment, setPayment] = useState("100");
  const pendingCents = debts.reduce((total, debt) => total + debt.principalCents - debt.paidCents, 0);

  function simulatePayment() {
    const paymentCents = Math.max(0, Math.round(Number(payment.replace(",", ".")) * 100) || 0);
    setDebts((current) =>
      current.map((debt) => {
        if (debt.id !== selectedDebtId) return debt;
        const pending = debt.principalCents - debt.paidCents;
        return { ...debt, paidCents: debt.paidCents + Math.min(paymentCents, pending) };
      })
    );
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 md:pb-8 lg:px-8">
      <Header />
      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg bg-[#0f3d35] p-5 text-white shadow-[0_20px_60px_rgba(23,33,29,0.16)]">
            <p className="text-sm text-white/70">Pendente em dividas</p>
            <strong className="mt-2 block text-4xl font-semibold">{formatCurrency(pendingCents)}</strong>
          </section>
          <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4">
            <h2 className="font-semibold">Novo pagamento</h2>
            <div className="mt-3 grid gap-3">
              <label className="grid gap-2 text-sm font-medium text-[#3f514a]">Divida<select className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" value={selectedDebtId} onChange={(event) => setSelectedDebtId(event.target.value)}>{debts.map((debt) => <option key={debt.id} value={debt.id}>{debt.creditor}</option>)}</select></label>
              <label className="grid gap-2 text-sm font-medium text-[#3f514a]">Conta de pagamento<span className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3 py-3 font-normal text-[#66746e]">{accounts[0].bank}</span></label>
              <label className="grid gap-2 text-sm font-medium text-[#3f514a]">Valor<input className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" inputMode="decimal" value={payment} onChange={(event) => setPayment(event.target.value)} /></label>
              <button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white" onClick={simulatePayment} type="button">Simular pagamento</button>
            </div>
          </section>
        </aside>
        <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Dividas cadastradas</h2>
            <p className="mt-1 text-sm text-[#66746e]">Pagamentos simulados reduzem o pendente apenas nesta tela.</p>
          </div>
          <div className="grid gap-3">
            {debts.map((debt) => {
              const pending = debt.principalCents - debt.paidCents;
              const progress = (debt.paidCents / debt.principalCents) * 100;
              return (
                <article className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4" key={debt.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><strong className="block truncate">{debt.creditor}</strong><span className="text-sm text-[#66746e]">Vence em {formatShortDate(debt.due)}</span></div>
                    <strong className="text-right text-[#b54747]">{formatCurrency(pending)}</strong>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#e5ece7]"><i className="block h-full rounded-full bg-[#0f6b57]" style={{ width: `${progress}%` }} /></div>
                  <div className="mt-3 flex items-center justify-between text-sm text-[#66746e]"><span>Pago {formatCurrency(debt.paidCents)}</span><span>Total {formatCurrency(debt.principalCents)}</span></div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
      <MobileAppNav active="debts" />
    </main>
  );
}

function Header() {
  return <header className="mb-4 flex min-h-16 items-center justify-between gap-4 md:sticky md:top-0 md:z-20 md:mb-6 md:bg-[#f6f4ef]/80 md:py-3 md:backdrop-blur-xl"><div><p className="mb-1 text-xs font-semibold text-[#66746e]">Hoje, {formatShortDate(baseDate)}</p><h1 className="text-2xl font-semibold md:text-3xl">Dividas</h1></div><DesktopAppNav active="debts" /><button className="grid size-11 place-items-center rounded-lg border border-[#dde4df] bg-white/80 shadow-sm" type="button" aria-label="Notificacoes"><Bell size={20} /></button></header>;
}
