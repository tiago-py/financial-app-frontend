import { Banknote, FileText, Home, Landmark, PieChart, ReceiptText, Settings } from "lucide-react";

type ActiveRoute = "home" | "accounts" | "transactions" | "add" | "debts" | "reports" | "settings";

const enabledRoutes = [
  { id: "home", href: "/", label: "Inicio", icon: Home },
  { id: "accounts", href: "/accounts", label: "Contas", icon: Landmark },
  { id: "transactions", href: "/transactions", label: "Extrato", icon: FileText },
  { id: "add", href: "/add", label: "Adicionar", icon: Banknote },
  { id: "debts", href: "/debts", label: "Dividas", icon: ReceiptText },
  { id: "reports", href: "/reports", label: "Relatorios", icon: PieChart },
  { id: "settings", href: "/settings", label: "Ajustes", icon: Settings }
] as const;

export function DesktopAppNav({ active }: { active: ActiveRoute }) {
  return (
    <nav className="hidden min-w-0 flex-1 items-center justify-center gap-0.5 lg:flex xl:gap-1" aria-label="Navegacao principal">
      {enabledRoutes.map((item) => (
        <a
          aria-current={active === item.id ? "page" : undefined}
          className={
            active === item.id
              ? "rounded-lg bg-[#0f6b57]/10 px-2.5 py-2 text-sm font-semibold text-[#0f3d35] xl:px-4"
              : "rounded-lg px-2.5 py-2 text-sm font-semibold text-[#66746e] hover:bg-white/70 hover:text-[#17211d] xl:px-4"
          }
          href={item.href}
          key={item.id}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

export function MobileAppNav({ active }: { active: ActiveRoute }) {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex justify-center border-t border-[#dde4df]/90 bg-[#f6f4ef]/88 px-2 py-2 pb-[calc(10px+env(safe-area-inset-bottom))] backdrop-blur-xl lg:hidden sm:px-3"
      aria-label="Navegacao principal"
    >
      <div className="grid w-full max-w-[680px] grid-cols-7 gap-0.5 sm:gap-1">
        {enabledRoutes.map((item) => {
          const Icon = item.icon;

          return (
            <a
              aria-current={active === item.id ? "page" : undefined}
              aria-label={item.label}
              className={
                active === item.id
                  ? "grid min-h-14 place-items-center rounded-lg bg-[#0f6b57]/10 text-[#0f3d35]"
                  : "grid min-h-14 place-items-center rounded-lg text-[#66746e]"
              }
              href={item.href}
              key={item.id}
            >
              <Icon size={22} aria-hidden="true" />
            </a>
          );
        })}
      </div>
    </nav>
  );
}
