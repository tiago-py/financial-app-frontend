"use client";

import {
  ArrowDownUp,
  Bell,
  CheckCircle2,
  LockKeyhole,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  WalletCards
} from "lucide-react";
import { useMemo, useState } from "react";
import { accounts, baseDate, totalInAccountsCents } from "@/features/home/mock";
import {
  accountRows,
  totalMonthlyIncomeCents,
  totalMonthlyOutcomeCents,
  totalPlannedOutflowCents,
  transferPreviews,
  type AccountStatus
} from "@/features/accounts/mock";
import { formatCurrency, formatShortDate } from "@/shared/lib/format";
import { DesktopAppNav, MobileAppNav } from "@/shared/ui/app-navigation";

type AccountsTab = "overview" | "accounts" | "transfers" | "settings";

const tabs: Array<{ id: AccountsTab; label: string }> = [
  { id: "overview", label: "Resumo" },
  { id: "accounts", label: "Contas" },
  { id: "transfers", label: "Transferencias" },
  { id: "settings", label: "Ajustes" }
];

const statusLabel: Record<AccountStatus, string> = {
  active: "Ativa",
  reserved: "Reserva",
  shared: "Compartilhada"
};

const statusClass: Record<AccountStatus, string> = {
  active: "bg-[#0f6b57]/10 text-[#0f3d35]",
  reserved: "bg-[#335c81]/10 text-[#27496d]",
  shared: "bg-[#bb7b22]/12 text-[#8a5715]"
};

const transferStatusLabel = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  draft: "Rascunho"
};

export function AccountsScreen() {
  const [activeTab, setActiveTab] = useState<AccountsTab>("overview");
  const biggestAccount = useMemo(() => [...accountRows].sort((a, b) => b.balanceCents - a.balanceCents)[0], []);
  const liquidMonthCents = totalMonthlyIncomeCents - totalMonthlyOutcomeCents;

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 md:pb-8 lg:px-8">
      <header className="mb-4 flex min-h-16 items-center justify-between gap-4 md:sticky md:top-0 md:z-20 md:mb-6 md:bg-[#f6f4ef]/80 md:py-3 md:backdrop-blur-xl">
        <div className="min-w-0">
          <p className="mb-1 text-xs font-semibold text-[#66746e]">Hoje, {formatShortDate(baseDate)}</p>
          <h1 className="text-2xl font-semibold tracking-normal md:text-3xl">Contas</h1>
        </div>

        <DesktopAppNav active="accounts" />

        <button
          className="grid size-11 shrink-0 place-items-center rounded-lg border border-[#dde4df] bg-white/80 shadow-sm"
          type="button"
          aria-label="Notificacoes"
        >
          <Bell size={20} aria-hidden="true" />
        </button>
      </header>

      <div className="grid gap-4 lg:grid-cols-[360px_minmax(0,1fr)] xl:gap-6">
        <aside className="grid gap-4 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-lg bg-[#0f3d35] p-5 text-white shadow-[0_20px_60px_rgba(23,33,29,0.16)] sm:p-6">
            <p className="mb-3 text-sm font-medium text-white/70">Saldo em bancos</p>
            <strong className="block text-4xl font-semibold leading-none sm:text-5xl lg:text-4xl xl:text-5xl">
              {formatCurrency(totalInAccountsCents)}
            </strong>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <MetricBox label="Contas" value={accounts.length.toString()} />
              <MetricBox label="Maior saldo" value={biggestAccount.bank} />
              <MetricBox label="Entrada mes" value={formatCurrency(totalMonthlyIncomeCents)} />
              <MetricBox label="Saida mes" value={formatCurrency(totalMonthlyOutcomeCents)} />
            </div>
          </section>

          <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-semibold">Acoes</h2>
            <div className="mt-4 grid gap-2">
              <button
                className="flex min-h-12 items-center gap-3 rounded-lg bg-[#0f6b57] px-4 text-sm font-semibold text-white"
                onClick={() => setActiveTab("accounts")}
                type="button"
              >
                <Plus size={18} aria-hidden="true" />
                Adicionar conta
              </button>
              <button
                className="flex min-h-12 items-center gap-3 rounded-lg border border-[#dde4df] bg-[#fbfbf8] px-4 text-sm font-semibold"
                onClick={() => setActiveTab("transfers")}
                type="button"
              >
                <ArrowDownUp size={18} aria-hidden="true" />
                Transferir entre contas
              </button>
            </div>
          </section>
        </aside>

        <section className="min-w-0 rounded-lg border border-[#dde4df] bg-white/82 shadow-sm">
          <div className="border-b border-[#dde4df] p-3 sm:p-4">
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#f0f4ef] p-1" role="tablist" aria-label="Abas de contas">
              {tabs.map((tab) => (
                <button
                  aria-selected={activeTab === tab.id}
                  className={
                    activeTab === tab.id
                      ? "min-h-10 rounded-lg bg-white px-2 text-xs font-semibold text-[#0f3d35] shadow-sm sm:text-sm"
                      : "min-h-10 rounded-lg px-2 text-xs font-semibold text-[#66746e] hover:bg-white/60 sm:text-sm"
                  }
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-4 sm:p-5">
            {activeTab === "overview" && (
              <OverviewTab biggestAccountName={biggestAccount.bank} liquidMonthCents={liquidMonthCents} />
            )}
            {activeTab === "accounts" && <AccountsListTab />}
            {activeTab === "transfers" && <TransfersTab />}
            {activeTab === "settings" && <SettingsTab />}
          </div>
        </section>
      </div>

      <MobileAppNav active="accounts" />
    </main>
  );
}

function MetricBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg border border-white/12 bg-white/10 p-3">
      <span className="block text-sm text-white/68">{label}</span>
      <strong className="mt-1 block truncate text-lg font-semibold">{value}</strong>
    </div>
  );
}

function OverviewTab({ biggestAccountName, liquidMonthCents }: { biggestAccountName: string; liquidMonthCents: number }) {
  return (
    <div className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-3">
        <SummaryCard label="Saldo total" value={formatCurrency(totalInAccountsCents)} tone="strong" />
        <SummaryCard label="Liquido do mes" value={formatCurrency(liquidMonthCents)} />
        <SummaryCard label="Compromissos previstos" value={formatCurrency(totalPlannedOutflowCents)} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <section className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Distribuicao por conta</h2>
              <p className="mt-1 text-sm text-[#66746e]">Maior saldo em {biggestAccountName}</p>
            </div>
            <WalletCards className="text-[#0f6b57]" size={22} aria-hidden="true" />
          </div>
          <div className="grid gap-3">
            {accountRows.map((account) => (
              <div key={account.id}>
                <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{account.bank}</span>
                  <strong>{formatCurrency(account.balanceCents)}</strong>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e5ece7]">
                  <i
                    className="block h-full rounded-full"
                    style={{
                      width: `${(account.balanceCents / totalInAccountsCents) * 100}%`,
                      background: account.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4">
          <h2 className="text-lg font-semibold">Saude das contas</h2>
          <div className="mt-4 grid gap-3">
            <HealthItem icon={ShieldCheck} label="Contas ativas" value={`${accountRows.filter((account) => account.status === "active").length} de ${accountRows.length}`} />
            <HealthItem icon={LockKeyhole} label="Reserva separada" value={formatCurrency(accountRows.find((account) => account.status === "reserved")?.balanceCents ?? 0)} />
            <HealthItem icon={CheckCircle2} label="Sem saldo negativo" value="4 contas" />
          </div>
        </section>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, tone }: { label: string; value: string; tone?: "strong" }) {
  return (
    <article className={tone === "strong" ? "rounded-lg bg-[#0f6b57] p-4 text-white" : "rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4"}>
      <span className={tone === "strong" ? "text-sm text-white/70" : "text-sm text-[#66746e]"}>{label}</span>
      <strong className="mt-2 block text-2xl font-semibold">{value}</strong>
    </article>
  );
}

function HealthItem({ icon: Icon, label, value }: { icon: typeof ShieldCheck; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="shrink-0 text-[#0f6b57]" size={18} aria-hidden="true" />
        <span className="truncate text-sm text-[#66746e]">{label}</span>
      </div>
      <strong className="text-right text-sm font-semibold">{value}</strong>
    </div>
  );
}

function AccountsListTab() {
  const [rows, setRows] = useState(accountRows);
  const [name, setName] = useState("Carteira principal");
  const [institution, setInstitution] = useState("Banco manual");
  const [balance, setBalance] = useState("0");

  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<AccountStatus | "all">("all");
  const [balanceFilter, setBalanceFilter] = useState<
    "all" | "positive" | "zero" | "negative"
  >("all");

  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("pt-BR");

    return rows.filter((account) => {
      const matchesSearch =
        !normalizedSearch ||
        account.bank.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        account.type.toLocaleLowerCase("pt-BR").includes(normalizedSearch) ||
        account.institutionCode.includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" || account.status === statusFilter;

      const matchesBalance =
        balanceFilter === "all" ||
        (balanceFilter === "positive" && account.balanceCents > 0) ||
        (balanceFilter === "zero" && account.balanceCents === 0) ||
        (balanceFilter === "negative" && account.balanceCents < 0);

      return matchesSearch && matchesStatus && matchesBalance;
    });
  }, [rows, search, statusFilter, balanceFilter]);

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "all" ||
    balanceFilter !== "all";

  function addAccount() {
    const balanceCents =
      Math.round(Number(balance.replace(",", ".")) * 100) || 0;

    if (!name.trim()) return;

    const id = `local-${crypto.randomUUID()}`;

    setRows((current) => [
      {
        id,
        bank: name.trim(),
        type: institution.trim() || "Banco manual",
        balanceCents,
        color: "#0f6b57",
        updatedAt: baseDate,
        accountId: id,
        status: "active",
        openingBalanceCents: balanceCents,
        monthlyIncomeCents: 0,
        monthlyOutcomeCents: 0,
        plannedOutflowCents: 0,
        institutionCode: "000",
        createdAt: baseDate
      },
      ...current
    ]);

    setName("");
    setInstitution("Banco manual");
    setBalance("0");
  }

  function deleteAccount(accountId: string) {
    const account = rows.find((item) => item.id === accountId);

    if (!account) return;

    const confirmed = window.confirm(
      `Deseja realmente apagar a conta "${account.bank}"?\n\n` +
        "Esta ação afeta apenas o mock atual."
    );

    if (!confirmed) return;

    setRows((current) =>
      current.filter((item) => item.id !== accountId)
    );
  }

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
    setBalanceFilter("all");
  }

  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-[#dde4df] pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Todas as contas</h2>

          <p className="mt-1 max-w-[62ch] text-sm text-[#66746e]">
            Contas manuais do mock atual.
          </p>
        </div>

        <div className="grid grid-cols-[minmax(0,1fr)_44px] gap-2 sm:flex sm:items-center">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-[#dde4df] bg-[#fbfbf8] px-3 text-sm text-[#66746e] sm:w-72">
            <Search size={17} aria-hidden="true" />

            <input
              className="min-w-0 flex-1 bg-transparent text-[#17211d] outline-none placeholder:text-[#8a9691]"
              type="search"
              placeholder="Buscar conta"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <button
            className={
              filtersOpen || statusFilter !== "all" || balanceFilter !== "all"
                ? "grid size-11 place-items-center rounded-lg bg-[#0f6b57] text-white"
                : "grid size-11 place-items-center rounded-lg border border-[#dde4df] bg-[#fbfbf8]"
            }
            type="button"
            aria-label="Filtros"
            aria-expanded={filtersOpen}
            onClick={() => setFiltersOpen((current) => !current)}
          >
            <SlidersHorizontal size={18} aria-hidden="true" />
          </button>
        </div>
      </div>

      {filtersOpen && (
        <section className="mt-4 rounded-lg border border-[#dde4df] bg-[#f7faf7] p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium text-[#3f514a]">
              Status

              <select
                className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target.value as AccountStatus | "all"
                  )
                }
              >
                <option value="all">Todos</option>
                <option value="active">Ativas</option>
                <option value="reserved">Reserva</option>
                <option value="shared">Compartilhadas</option>
              </select>
            </label>

            <label className="grid gap-2 text-sm font-medium text-[#3f514a]">
              Saldo

              <select
                className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3"
                value={balanceFilter}
                onChange={(event) =>
                  setBalanceFilter(
                    event.target.value as
                      | "all"
                      | "positive"
                      | "zero"
                      | "negative"
                  )
                }
              >
                <option value="all">Todos</option>
                <option value="positive">Saldo positivo</option>
                <option value="zero">Saldo zerado</option>
                <option value="negative">Saldo negativo</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#dde4df] pt-4">
            <span className="text-sm text-[#66746e]">
              {filteredRows.length}{" "}
              {filteredRows.length === 1
                ? "conta encontrada"
                : "contas encontradas"}
            </span>

            <button
              className="min-h-10 rounded-lg border border-[#dde4df] bg-white px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
              type="button"
              disabled={!hasActiveFilters}
              onClick={clearFilters}
            >
              Limpar filtros
            </button>
          </div>
        </section>
      )}

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-[#66746e]">
          Exibindo {filteredRows.length} de {rows.length}
        </span>
      </div>

      {filteredRows.length === 0 && (
        <div className="mt-4 rounded-lg border border-dashed border-[#ccd6d0] bg-[#fbfbf8] px-4 py-10 text-center">
          <strong className="block font-semibold">
            Nenhuma conta encontrada
          </strong>

          <p className="mt-1 text-sm text-[#66746e]">
            Tente alterar ou limpar os filtros.
          </p>

          {hasActiveFilters && (
            <button
              className="mt-4 rounded-lg bg-[#0f6b57] px-4 py-2 text-sm font-semibold text-white"
              type="button"
              onClick={clearFilters}
            >
              Limpar filtros
            </button>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 lg:hidden">
        {filteredRows.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onDelete={() => deleteAccount(account.id)}
          />
        ))}
      </div>

      {filteredRows.length > 0 && (
        <div className="mt-4 hidden overflow-hidden rounded-lg border border-[#e7ece8] lg:block">
          <div className="grid grid-cols-[minmax(220px,1.2fr)_minmax(110px,0.55fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_minmax(120px,0.55fr)_52px] bg-[#f0f7f2] px-4 py-3 text-sm font-semibold text-[#3f514a]">
            <span>Banco</span>
            <span>Status</span>
            <span className="text-right">Saldo</span>
            <span className="text-right">Saída prevista</span>
            <span className="text-right">Atualização</span>
            <span className="sr-only">Ações</span>
          </div>

          {filteredRows.map((account) => (
            <article
              className="grid grid-cols-[minmax(220px,1.2fr)_minmax(110px,0.55fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_minmax(120px,0.55fr)_52px] items-center border-t border-[#e7ece8] bg-[#fbfbf8] px-4 py-4"
              key={account.id}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="grid size-10 place-items-center rounded-lg text-sm font-bold text-white"
                  style={{ background: account.color }}
                  aria-hidden="true"
                >
                  {account.bank.slice(0, 1)}
                </div>

                <div className="min-w-0">
                  <strong className="block truncate font-semibold">
                    {account.bank}
                  </strong>

                  <span className="block truncate text-sm text-[#66746e]">
                    Código {account.institutionCode}
                  </span>
                </div>
              </div>

              <span
                className={`w-fit rounded-full px-2 py-1 text-xs font-semibold ${statusClass[account.status]}`}
              >
                {statusLabel[account.status]}
              </span>

              <strong className="text-right font-semibold">
                {formatCurrency(account.balanceCents)}
              </strong>

              <span className="text-right text-sm text-[#66746e]">
                {formatCurrency(account.plannedOutflowCents)}
              </span>

              <span className="text-right text-sm text-[#66746e]">
                {formatShortDate(account.updatedAt)}
              </span>

              <button
                className="grid size-10 place-items-center justify-self-end rounded-lg text-[#a43b32] transition hover:bg-[#a43b32]/10"
                type="button"
                aria-label={`Apagar conta ${account.bank}`}
                title={`Apagar ${account.bank}`}
                onClick={() => deleteAccount(account.id)}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </article>
          ))}
        </div>
      )}

      <section className="mt-4 rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4">
        <h3 className="text-base font-semibold">Nova conta</h3>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-medium text-[#3f514a]">
            Nome da conta

            <input
              className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#3f514a]">
            Instituição

            <input
              className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3"
              value={institution}
              onChange={(event) => setInstitution(event.target.value)}
            />
          </label>

          <label className="grid gap-2 text-sm font-medium text-[#3f514a]">
            Saldo inicial

            <input
              className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3"
              inputMode="decimal"
              value={balance}
              onChange={(event) => setBalance(event.target.value)}
            />
          </label>

          <button
            className="min-h-11 self-end rounded-lg bg-[#0f6b57] px-4 font-semibold text-white"
            onClick={addAccount}
            type="button"
          >
            Criar conta simulada
          </button>
        </div>
      </section>
    </div>
  );
}

function AccountCard({
  account,
  onDelete
}: {
  account: (typeof accountRows)[number];
  onDelete: () => void;
}) {
  return (
    <article className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="grid size-11 place-items-center rounded-lg text-sm font-bold text-white"
            style={{ background: account.color }}
            aria-hidden="true"
          >
            {account.bank.slice(0, 1)}
          </div>

          <div className="min-w-0">
            <strong className="block truncate font-semibold">
              {account.bank}
            </strong>

            <span className="block truncate text-sm text-[#66746e]">
              {account.type}
            </span>
          </div>
        </div>

        <strong className="text-right font-semibold">
          {formatCurrency(account.balanceCents)}
        </strong>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#e7ece8] pt-3">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass[account.status]}`}
          >
            {statusLabel[account.status]}
          </span>

          <span className="text-sm text-[#66746e]">
            {formatShortDate(account.updatedAt)}
          </span>
        </div>

        <button
          className="grid size-10 place-items-center rounded-lg text-[#a43b32] transition hover:bg-[#a43b32]/10"
          type="button"
          aria-label={`Apagar conta ${account.bank}`}
          title={`Apagar ${account.bank}`}
          onClick={onDelete}
        >
          <Trash2 size={18} aria-hidden="true" />
        </button>
      </div>
    </article>
  );
}

function TransfersTab() {
  const [items, setItems] = useState(transferPreviews);
  const [fromId, setFromId] = useState(accountRows[0].id);
  const [toId, setToId] = useState(accountRows[1].id);
  const [amount, setAmount] = useState("750");

  function addTransfer() {
    const amountCents = Math.max(0, Math.round(Number(amount.replace(",", ".")) * 100) || 0);
    if (fromId === toId || amountCents <= 0) return;
    setItems((current) => [
      {
        id: `trf-local-${current.length + 1}`,
        fromAccountId: fromId,
        toAccountId: toId,
        amountCents,
        scheduledFor: baseDate,
        status: "draft"
      },
      ...current
    ]);
  }

  return (
    <div id="transferencias" className="grid gap-4 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4">
        <h2 className="text-lg font-semibold">Nova transferencia</h2>
        <div className="mt-4 grid gap-3">
          <label className="grid gap-2 text-sm font-medium text-[#3f514a]">Conta de origem<select className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" value={fromId} onChange={(event) => setFromId(event.target.value)}>{accountRows.map((account) => <option key={account.id} value={account.id}>{account.bank}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-medium text-[#3f514a]">Conta de destino<select className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" value={toId} onChange={(event) => setToId(event.target.value)}>{accountRows.map((account) => <option key={account.id} value={account.id}>{account.bank}</option>)}</select></label>
          <label className="grid gap-2 text-sm font-medium text-[#3f514a]">Valor<input className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
          <button className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white" onClick={addTransfer} type="button">Simular transferencia</button>
        </div>
        <div className="mt-4 rounded-lg bg-[#f0f7f2] p-3 text-sm text-[#3f514a]">
          Chave de idempotencia sera mantida pelo cliente quando a API existir.
        </div>
      </section>

      <section className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4">
        <h2 className="text-lg font-semibold">Transferencias recentes</h2>
        <div className="mt-4 grid gap-2">
          {items.map((transfer) => {
            const from = accountRows.find((account) => account.id === transfer.fromAccountId);
            const to = accountRows.find((account) => account.id === transfer.toAccountId);

            return (
              <article className="rounded-lg bg-white p-3" key={transfer.id}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <strong className="block truncate font-semibold">
                      {from?.bank} para {to?.bank}
                    </strong>
                    <span className="block text-sm text-[#66746e]">{formatShortDate(transfer.scheduledFor)}</span>
                  </div>
                  <strong className="text-right font-semibold">{formatCurrency(transfer.amountCents)}</strong>
                </div>
                <span className="mt-3 inline-flex rounded-full bg-[#0f6b57]/10 px-2 py-1 text-xs font-semibold text-[#0f3d35]">
                  {transferStatusLabel[transfer.status]}
                </span>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function SettingsTab() {
  const [negativeBalance, setNegativeBalance] = useState("Pendente");
  const [defaultType, setDefaultType] = useState("Conta corrente");

  return (
    <div id="ajustes" className="grid gap-4 xl:grid-cols-2">
      <section className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4">
        <h2 className="text-lg font-semibold">Regras de conta</h2>
        <div className="mt-4 grid gap-3">
          <ToggleRow label="Permitir saldo negativo" value={negativeBalance} onClick={() => setNegativeBalance((value) => value === "Pendente" ? "Nao permitir" : "Pendente")} />
          <ToggleRow label="Arquivar com historico" value="Obrigatorio" />
          <ToggleRow label="Saldo inicial editavel" value="Com ajuste auditado" />
        </div>
      </section>

      <section className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4">
        <h2 className="text-lg font-semibold">Campos do cadastro</h2>
        <div className="mt-4 grid gap-3">
          <FormField label="Moeda padrao" value="BRL" />
          <label className="grid gap-2 text-sm font-medium text-[#3f514a]">Tipo padrao<input className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3" value={defaultType} onChange={(event) => setDefaultType(event.target.value)} /></label>
          <FormField label="Visibilidade" value="Mostrar na Home" />
        </div>
      </section>
    </div>
  );
}

function FormField({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[#3f514a]">
      {label}
      <span className="min-h-11 rounded-lg border border-[#dde4df] bg-white px-3 py-3 font-normal text-[#66746e]">{value}</span>
    </label>
  );
}

function ToggleRow({ label, value, onClick }: { label: string; value: string; onClick?: () => void }) {
  return (
    <button className="flex items-center justify-between gap-4 rounded-lg bg-white p-3 text-left" onClick={onClick} type="button">
      <div className="min-w-0">
        <strong className="block truncate text-sm font-semibold">{label}</strong>
        <span className="block truncate text-sm text-[#66746e]">{value}</span>
      </div>
      <Pencil className="shrink-0 text-[#66746e]" size={18} aria-hidden="true" />
    </button>
  );
}
