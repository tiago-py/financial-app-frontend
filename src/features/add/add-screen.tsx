"use client";

import { Bell, CreditCard, HandCoins, ReceiptText, Repeat } from "lucide-react";
import { useState } from "react";
import { accounts, baseDate } from "@/features/home/mock";
import { DesktopAppNav, MobileAppNav } from "@/shared/ui/app-navigation";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";

type ActionKind = "Despesa" | "Receita" | "Transferencia" | "Pagamento de divida";

const actions: Array<{ title: ActionKind; icon: typeof CreditCard; copy: string }> = [
  { title: "Despesa", icon: CreditCard, copy: "Registrar gasto comum em uma conta." },
  { title: "Receita", icon: HandCoins, copy: "Registrar salario ou renda extra." },
  { title: "Transferencia", icon: Repeat, copy: "Mover dinheiro entre contas sem afetar consolidado." },
  { title: "Pagamento de divida", icon: ReceiptText, copy: "Gerar uma unica saida vinculada a divida." }
];

export function AddScreen() {
  const [kind, setKind] = useState<ActionKind>("Despesa");
  const [accountId, setAccountId] = useState(accounts[0].id);
  const [description, setDescription] = useState("Mercado");
  const [amount, setAmount] = useState("125.50");
  const [items, setItems] = useState<Array<{ id: string; kind: ActionKind; description: string; amountCents: number }>>([]);
  const amountCents = Math.max(0, Math.round(Number(amount.replace(",", ".")) * 100) || 0);

  function simulateEntry() {
    if (!description.trim() || amountCents <= 0) return;
    setItems((current) => [{ id: crypto.randomUUID(), kind, description, amountCents }, ...current]);
  }

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 md:pb-8 lg:px-8">
      <Header />
      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <section className="rounded-lg bg-[#0f3d35] p-5 text-white shadow-[0_20px_60px_rgba(23,33,29,0.16)] sm:p-6">
          <p className="text-sm text-white/70">Nova movimentacao</p>
          <h2 className="mt-2 max-w-[12ch] text-4xl font-semibold leading-none sm:text-5xl">{formatCurrency(amountCents)}</h2>
          <p className="mt-5 max-w-[44ch] text-sm leading-6 text-white/72">
            {kind} simulada em {accounts.find((account) => account.id === accountId)?.bank}.
          </p>
        </section>

        <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => {
              const Icon = action.icon;
              const active = kind === action.title;
              return (
                <button
                  className={
                    active
                      ? "min-h-32 rounded-lg border border-[#0f6b57] bg-[#f0f7f2] p-4 text-left"
                      : "min-h-32 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4 text-left hover:bg-[#f0f7f2]"
                  }
                  key={action.title}
                  onClick={() => setKind(action.title)}
                  type="button"
                >
                  <Icon className="text-[#0f6b57]" size={22} />
                  <strong className="mt-4 block">{action.title}</strong>
                  <span className="mt-1 block text-sm leading-5 text-[#66746e]">{action.copy}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#3f514a]">
              Conta
              <select className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" value={accountId} onChange={(event) => setAccountId(event.target.value)}>
                {accounts.map((account) => <option key={account.id} value={account.id}>{account.bank}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#3f514a]">
              Valor
              <input className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-medium text-[#3f514a] md:col-span-2">
              Descricao
              <input className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            <button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white md:col-span-2" onClick={simulateEntry} type="button">
              Simular lancamento
            </button>
          </div>

          <div className="mt-4 grid gap-2">
            {items.map((item) => (
              <article className="flex items-center justify-between gap-3 rounded-lg bg-[#fbfbf8] p-3" key={item.id}>
                <div><strong className="block">{item.description}</strong><span className="text-sm text-[#66746e]">{item.kind}</span></div>
                <strong>{formatCurrency(item.amountCents)}</strong>
              </article>
            ))}
          </div>
        </section>
      </div>
      <MobileAppNav active="add" />
    </main>
  );
}

function Header() {
  return <header className="mb-4 flex min-h-16 items-center justify-between gap-4 md:sticky md:top-0 md:z-20 md:mb-6 md:bg-[#f6f4ef]/80 md:py-3 md:backdrop-blur-xl"><div><p className="mb-1 text-xs font-semibold text-[#66746e]">Hoje, {formatShortDate(baseDate)}</p><h1 className="text-2xl font-semibold md:text-3xl">Adicionar</h1></div><DesktopAppNav active="add" /><button className="grid size-11 place-items-center rounded-lg border border-[#dde4df] bg-white/80 shadow-sm" type="button" aria-label="Notificacoes"><Bell size={20} /></button></header>;
}
