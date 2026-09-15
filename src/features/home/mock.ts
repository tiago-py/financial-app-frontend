export type Account = {
  id: string;
  bank: string;
  type: string;
  balanceCents: number;
  color: string;
  updatedAt: string;
};

export type PaidBill = {
  id: string;
  name: string;
  accountId: string;
  paidOn: string;
  amountCents: number;
};

export type ProjectionPoint = {
  month: string;
  projectedBalanceCents: number;
  plannedIncomeCents: number;
  plannedCommitmentsCents: number;
  variableSpendingEstimateCents: number;
};

export const baseDate = "2026-09-14";

export const accounts: Account[] = [
  {
    id: "nubank",
    bank: "Nubank",
    type: "Conta principal",
    balanceCents: 842930,
    color: "#6d3fd1",
    updatedAt: "2026-09-14"
  },
  {
    id: "itau",
    bank: "Itau",
    type: "Salario",
    balanceCents: 521840,
    color: "#ef7d18",
    updatedAt: "2026-09-13"
  },
  {
    id: "inter",
    bank: "Inter",
    type: "Reserva curta",
    balanceCents: 396250,
    color: "#d95d22",
    updatedAt: "2026-09-12"
  },
  {
    id: "bb",
    bank: "Banco do Brasil",
    type: "Conta compartilhada",
    balanceCents: 172660,
    color: "#335c81",
    updatedAt: "2026-09-11"
  }
];

export const paidBills: PaidBill[] = [
  {
    id: "rent",
    name: "Aluguel",
    accountId: "itau",
    paidOn: "2026-09-05",
    amountCents: 235000
  },
  {
    id: "energy",
    name: "Energia",
    accountId: "nubank",
    paidOn: "2026-09-09",
    amountCents: 28640
  },
  {
    id: "internet",
    name: "Internet",
    accountId: "nubank",
    paidOn: "2026-09-10",
    amountCents: 12990
  },
  {
    id: "card",
    name: "Cartao pago",
    accountId: "bb",
    paidOn: "2026-09-12",
    amountCents: 184360
  }
];

export const projections: ProjectionPoint[] = [
  {
    month: "Out/26",
    projectedBalanceCents: 2057800,
    plannedIncomeCents: 920000,
    plannedCommitmentsCents: 318000,
    variableSpendingEstimateCents: 410000
  },
  {
    month: "Nov/26",
    projectedBalanceCents: 2246200,
    plannedIncomeCents: 920000,
    plannedCommitmentsCents: 321000,
    variableSpendingEstimateCents: 410600
  },
  {
    month: "Dez/26",
    projectedBalanceCents: 2365400,
    plannedIncomeCents: 1020000,
    plannedCommitmentsCents: 382000,
    variableSpendingEstimateCents: 519800
  },
  {
    month: "Jan/27",
    projectedBalanceCents: 2519100,
    plannedIncomeCents: 920000,
    plannedCommitmentsCents: 326500,
    variableSpendingEstimateCents: 439800
  }
];

export const recentAccounts = accounts.slice(0, 3);

export const totalInAccountsCents = accounts.reduce((total, account) => total + account.balanceCents, 0);
export const paidBillsTotalCents = paidBills.reduce((total, bill) => total + bill.amountCents, 0);
export const availableAfterPaidBillsCents = totalInAccountsCents - paidBillsTotalCents;
