import { accounts } from "@/features/home/mock";

export type AccountStatus = "active" | "reserved" | "shared";

export type AccountMeta = {
  accountId: string;
  status: AccountStatus;
  openingBalanceCents: number;
  monthlyIncomeCents: number;
  monthlyOutcomeCents: number;
  plannedOutflowCents: number;
  institutionCode: string;
  createdAt: string;
};

export type TransferPreview = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amountCents: number;
  scheduledFor: string;
  status: "scheduled" | "confirmed" | "draft";
};

export const accountMeta: AccountMeta[] = [
  {
    accountId: "nubank",
    status: "active",
    openingBalanceCents: 620000,
    monthlyIncomeCents: 320000,
    monthlyOutcomeCents: 178430,
    plannedOutflowCents: 89900,
    institutionCode: "260",
    createdAt: "2026-01-03"
  },
  {
    accountId: "itau",
    status: "active",
    openingBalanceCents: 430000,
    monthlyIncomeCents: 600000,
    monthlyOutcomeCents: 508160,
    plannedOutflowCents: 235000,
    institutionCode: "341",
    createdAt: "2025-11-18"
  },
  {
    accountId: "inter",
    status: "reserved",
    openingBalanceCents: 310000,
    monthlyIncomeCents: 120000,
    monthlyOutcomeCents: 33750,
    plannedOutflowCents: 0,
    institutionCode: "077",
    createdAt: "2026-02-10"
  },
  {
    accountId: "bb",
    status: "shared",
    openingBalanceCents: 250000,
    monthlyIncomeCents: 80000,
    monthlyOutcomeCents: 157340,
    plannedOutflowCents: 42000,
    institutionCode: "001",
    createdAt: "2025-08-27"
  }
];

export const transferPreviews: TransferPreview[] = [
  {
    id: "trf-001",
    fromAccountId: "itau",
    toAccountId: "inter",
    amountCents: 75000,
    scheduledFor: "2026-09-18",
    status: "scheduled"
  },
  {
    id: "trf-002",
    fromAccountId: "nubank",
    toAccountId: "bb",
    amountCents: 42000,
    scheduledFor: "2026-09-20",
    status: "draft"
  },
  {
    id: "trf-003",
    fromAccountId: "bb",
    toAccountId: "nubank",
    amountCents: 56000,
    scheduledFor: "2026-09-08",
    status: "confirmed"
  }
];

export const accountRows = accounts.map((account) => ({
  ...account,
  ...accountMeta.find((meta) => meta.accountId === account.id)!
}));

export const totalMonthlyIncomeCents = accountRows.reduce((total, account) => total + account.monthlyIncomeCents, 0);
export const totalMonthlyOutcomeCents = accountRows.reduce((total, account) => total + account.monthlyOutcomeCents, 0);
export const totalPlannedOutflowCents = accountRows.reduce((total, account) => total + account.plannedOutflowCents, 0);
