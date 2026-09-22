import { Bell } from "lucide-react";
import { DesktopAppNav } from "@/shared/ui/app-navigation";
import { formatShortDate } from "@/shared/lib/format";
import { todayISO } from "@/shared/api/client";

type ActiveRoute = Parameters<typeof DesktopAppNav>[0]["active"];

export function PageHeader({ title, active }: { title: string; active: ActiveRoute }) {
  return (
    <header className="mb-4 flex min-h-16 items-center justify-between gap-3 lg:sticky lg:top-0 lg:z-20 lg:mb-6 lg:bg-[#f6f4ef]/80 lg:py-3 lg:backdrop-blur-xl xl:gap-4">
      <div className="min-w-0">
        <p className="mb-1 text-xs font-semibold text-[#66746e]">
          Hoje, {formatShortDate(todayISO())}
        </p>
        <h1 className="break-words text-2xl font-semibold sm:text-3xl">{title}</h1>
      </div>
      <DesktopAppNav active={active} />
      <button
        className="grid size-11 shrink-0 place-items-center rounded-lg border border-[#dde4df] bg-white/80 shadow-sm"
        type="button"
        aria-label="Notificacoes"
      >
        <Bell size={20} aria-hidden="true" />
      </button>
    </header>
  );
}

export function LoadingPanel({ label = "Carregando dados..." }: { label?: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-[#dde4df] bg-white/82 p-6 text-sm text-[#66746e]">
      {label}
    </div>
  );
}

export function ErrorPanel({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="rounded-lg border border-[#e8cbc7] bg-[#fff5f3] p-4 text-sm text-[#a43b32]" role="alert">
      <p>{message}</p>
      {retry && (
        <button className="mt-3 rounded-lg border border-[#e8cbc7] bg-white px-3 py-2 font-semibold" onClick={retry} type="button">
          Tentar novamente
        </button>
      )}
    </div>
  );
}
