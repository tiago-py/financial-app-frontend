import {
  ArrowDownUp,
  BarChart3,
  Bell,
  Plus,
  ReceiptText
} from "lucide-react";
import {
  accounts,
  availableAfterPaidBillsCents,
  baseDate,
  paidBills,
  projections,
  recentAccounts,
  totalInAccountsCents
} from "./mock";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";
import { DesktopAppNav, MobileAppNav } from "@/shared/ui/app-navigation";

const maxProjection = Math.max(...projections.map((projection) => projection.projectedBalanceCents));

const quickActions = [
  { label: "Adicionar", icon: Plus, href: "/add" },
  { label: "Transferir", icon: ArrowDownUp, href: "/accounts" },
  { label: "Pagar", icon: ReceiptText, href: "/debts" },
  { label: "Projetar", icon: BarChart3, href: "/reports" }
];

export function HomeScreen() {
  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 md:pb-8 lg:px-8">
      <header className="mb-4 flex min-h-16 items-center justify-between gap-4 md:sticky md:top-0 md:z-20 md:mb-6 md:bg-[#f6f4ef]/80 md:py-3 md:backdrop-blur-xl">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-[#66746e]">Hoje, {formatShortDate(baseDate)}</p>
          <h1 className="text-2xl font-semibold tracking-normal text-[#17211d] md:text-3xl">Inicio</h1>
        </div>

        <DesktopAppNav active="home" />

        <button
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-[#dde4df] bg-white/80 text-[#17211d] shadow-sm"
          type="button"
          aria-label="Notificacoes"
        >
          <Bell size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] xl:grid-cols-[380px_minmax(0,1fr)] xl:gap-6">
        <section
          className="overflow-hidden rounded-lg bg-[#0f3d35] text-white shadow-[0_20px_60px_rgba(23,33,29,0.16)] lg:sticky lg:top-24 lg:min-h-[560px]"
          aria-labelledby="saldo-total"
        >
          <div className="flex h-full flex-col justify-between gap-8 p-5 sm:p-6 lg:p-7">
            <div>
              <p className="mb-3 text-sm font-medium text-white/70">Saldo consolidado</p>
              <h2 id="saldo-total" className="max-w-[9ch] text-xl font-semibold leading-none tracking-normal sm:text-6xl lg:text-5xl xl:text-5xl">
                {formatCurrency(availableAfterPaidBillsCents)}
              </h2>
              <span className="block text-sm text-white/68 mt-3">Contas cadastradas: {accounts.length}</span>
            </div>

            <div className="grid gap-3">
              <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                <span className="block text-sm text-white/68">Dinheiro nas contas</span>
                <strong className="mt-1 block text-xl font-semibold">{formatCurrency(totalInAccountsCents)}</strong>
              </div>
              <div className="rounded-lg border border-white/12 bg-white/10 p-4">
                <span className="block text-sm text-white/68">Contas pagas no mes</span>
                <strong className="mt-1 block text-xl font-semibold">
                  {formatCurrency(totalInAccountsCents - availableAfterPaidBillsCents)}
                </strong>
              </div>
            </div>

            <p className="max-w-[42ch] text-sm leading-6 text-white/72">
              Mock demonstrativo com bancos cadastrados e contas ja pagas abatidas do saldo disponivel.
            </p>
          </div>
        </section>

        <div className="grid min-w-0 gap-4 xl:gap-5">
          <nav
            className="grid grid-cols-4 gap-2 rounded-lg border border-[#dde4df] bg-white/70 p-2 shadow-sm sm:gap-3 lg:bg-white/80"
            aria-label="Acoes rapidas"
          >
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <a
                  className="flex min-h-16 flex-col items-center justify-center gap-2 rounded-lg text-xs font-semibold text-[#17211d] hover:bg-[#f0f7f2] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0f6b57] sm:min-h-20 sm:text-sm lg:flex-row lg:justify-start lg:px-4"
                  href={action.href}
                  key={action.label}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{action.label}</span>
                </a>
              );
            })}
          </nav>

          <div className="grid min-w-0 gap-4 xl:grid-cols-2 xl:items-start xl:gap-5">
            <section
              className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5"
              id="todas-contas"
              aria-labelledby="contas-recentes"
            >
              <div className="mb-4 flex items-start justify-between gap-4">
                <div>
                  <h2 id="contas-recentes" className="text-lg font-semibold text-[#17211d]">
                    Contas recentes
                  </h2>
                  <p className="mt-1 text-sm text-[#66746e]">Ultimos bancos movimentados</p>
                </div>
                <a className="shrink-0 rounded-lg px-2 py-1 text-sm font-semibold text-[#0f6b57]" href="/accounts">
                  Ver todas
                </a>
              </div>

              <div className="grid gap-2">
                {recentAccounts.map((account) => (
                  <article
                    className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-3"
                    key={account.id}
                  >
                    <div
                      className="grid size-11 place-items-center rounded-lg text-sm font-bold text-white"
                      style={{ background: account.color }}
                      aria-hidden="true"
                    >
                      {account.bank.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <strong className="block truncate font-semibold">{account.bank}</strong>
                      <span className="block truncate text-sm text-[#66746e]">
                        {account.type} - {formatShortDate(account.updatedAt)}
                      </span>
                    </div>
                    <strong className="text-right text-sm font-semibold sm:text-base">
                      {formatCurrency(account.balanceCents)}
                    </strong>
                  </article>
                ))}
              </div>
            </section>

            <section
              className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5"
              aria-labelledby="contas-pagas"
            >
              <div className="mb-4">
                <h2 id="contas-pagas" className="text-lg font-semibold text-[#17211d]">
                  Contas pagas
                </h2>
                <p className="mt-1 text-sm text-[#66746e]">Ja abatidas do saldo disponivel</p>
              </div>

              <div className="grid gap-2">
                {paidBills.map((bill) => {
                  const account = accounts.find((item) => item.id === bill.accountId);

                  return (
                    <article
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-lg bg-[#fbfbf8] p-3"
                      key={bill.id}
                    >
                      <div className="min-w-0">
                        <strong className="block truncate font-semibold">{bill.name}</strong>
                        <span className="block truncate text-sm text-[#66746e]">
                          {account?.bank ?? "Conta"} - {formatShortDate(bill.paidOn)}
                        </span>
                      </div>
                      <strong className="text-right text-sm font-semibold text-[#b54747] sm:text-base">
                        -{formatCurrency(bill.amountCents)}
                      </strong>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          <section
            className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5"
            aria-labelledby="projecao"
          >
            <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 id="projecao" className="text-lg font-semibold text-[#17211d]">
                  Proximos meses
                </h2>
                <p className="mt-1 max-w-[64ch] text-sm text-[#66746e]">
                  Cenario com renda prevista, compromissos e media variavel.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {projections.map((projection) => (
                <article className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4" key={projection.month}>
                  <div className="mb-3 flex items-start justify-between gap-3 xl:block">
                    <strong className="block font-semibold">{projection.month}</strong>
                    <strong className="block text-right font-semibold xl:mt-1 xl:text-left">
                      {formatCurrency(projection.projectedBalanceCents)}
                    </strong>
                  </div>
                  <div
                    className="h-2 overflow-hidden rounded-full bg-[#e5ece7]"
                    aria-label={`Saldo projetado de ${formatCurrency(projection.projectedBalanceCents)}`}
                  >
                    <i
                      className="block h-full rounded-full bg-gradient-to-r from-[#0f6b57] to-[#335c81]"
                      style={{ width: `${(projection.projectedBalanceCents / maxProjection) * 100}%` }}
                    />
                  </div>
                  <span className="mt-3 block text-sm leading-5 text-[#66746e]">
                    Entradas {formatCurrency(projection.plannedIncomeCents)} - compromissos{" "}
                    {formatCurrency(projection.plannedCommitmentsCents)}
                  </span>
                </article>
              ))}
            </div>

            <p className="mt-4 text-sm leading-6 text-[#66746e]">
              Projecoes sao cenarios do mock, nao lancamentos realizados nem promessa de resultado.
            </p>
          </section>
        </div>
      </div>

      <MobileAppNav active="home" />
    </main>
  );
}
