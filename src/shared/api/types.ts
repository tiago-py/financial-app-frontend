export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  timezone: string;
  currency: string;
  createdAt: string;
};

export type Account = {
  id: string;
  name: string;
  institution: string | null;
  type: string;
  currency: string;
  openingBalanceCents: number;
  openedOn: string;
  color: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AccountBalance = {
  accountId: string;
  accountName: string;
  amountCents: number;
  currency: string;
};

export type Balances = {
  accounts: AccountBalance[];
  totalAmountCents: number;
  currency: string;
  accountCount: number;
};

export type Category = {
  id: string;
  name: string;
  purpose: "income" | "expense";
  color: string | null;
  archivedAt: string | null;
};

export type Transaction = {
  id: string;
  accountId: string;
  accountName: string;
  categoryId: string | null;
  categoryName?: string | null;
  amountCents: number;
  currency: string;
  direction: "in" | "out";
  kind: "income" | "expense" | "transfer" | "debt_payment" | "reversal";
  occurredOn: string;
  description: string;
  originType?: string | null;
  originId?: string | null;
  reversalOfId?: string | null;
};

export type Transfer = {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amountCents: number;
  currency: string;
  occurredOn: string;
  description: string;
  reversedAt: string | null;
};

export type Debt = {
  id: string;
  description: string;
  creditor: string | null;
  principalCents: number;
  paidCents: number;
  pendingCents: number;
  currency: string;
  dueDate: string | null;
  status: "active" | "paid" | "cancelled" | "archived";
};

export type SpendingReport = {
  from: string;
  to: string;
  totalAmountCents: number;
  currency: string;
  byCategory: Array<{
    categoryId: string | null;
    categoryName: string;
    amountCents: number;
  }>;
};

export type ProjectionPoint = {
  month: string;
  projectedBalanceCents: number;
  plannedIncomeCents: number;
  plannedOutflowCents: number;
};
