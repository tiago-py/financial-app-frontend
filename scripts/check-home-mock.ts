import {
  accounts,
  availableAfterPaidBillsCents,
  paidBills,
  paidBillsTotalCents,
  projections,
  totalInAccountsCents
} from "../src/features/home/mock";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

assert(accounts.length >= 3, "O mock deve ter ao menos tres contas recentes.");
assert(projections.length >= 3, "O mock deve projetar ao menos tres meses.");

for (const account of accounts) {
  assert(Number.isInteger(account.balanceCents), `Saldo invalido em ${account.bank}.`);
  assert(account.balanceCents >= 0, `Saldo negativo nao decidido em ${account.bank}.`);
}

for (const bill of paidBills) {
  assert(Number.isInteger(bill.amountCents), `Conta paga invalida em ${bill.name}.`);
  assert(accounts.some((account) => account.id === bill.accountId), `Conta inexistente em ${bill.name}.`);
}

const computedAccountsTotal = accounts.reduce((total, account) => total + account.balanceCents, 0);
const computedPaidBillsTotal = paidBills.reduce((total, bill) => total + bill.amountCents, 0);

assert(totalInAccountsCents === computedAccountsTotal, "Total em contas divergente.");
assert(paidBillsTotalCents === computedPaidBillsTotal, "Total de contas pagas divergente.");
assert(
  availableAfterPaidBillsCents === totalInAccountsCents - paidBillsTotalCents,
  "Saldo consolidado deve subtrair contas pagas."
);

for (const projection of projections) {
  assert(Number.isInteger(projection.projectedBalanceCents), `Projecao invalida em ${projection.month}.`);
  assert(Number.isInteger(projection.plannedIncomeCents), `Renda prevista invalida em ${projection.month}.`);
  assert(
    Number.isInteger(projection.plannedCommitmentsCents),
    `Compromissos previstos invalidos em ${projection.month}.`
  );
}

console.log("Mock da Home consistente.");
