"use client";

import { Bell, Download, Palette, ShieldCheck, Smartphone } from "lucide-react";
import { useState } from "react";
import { baseDate } from "@/features/home/mock";
import { DesktopAppNav, MobileAppNav } from "@/shared/ui/app-navigation";
import { formatShortDate } from "@/shared/lib/format";

const settings = [
  { title: "Seguranca", value: "Sessao por cookie HttpOnly proposta", icon: ShieldCheck },
  { title: "PWA", value: "Manifesto e fallback offline publico", icon: Smartphone },
  { title: "Aparencia", value: "Tema claro mobile-first", icon: Palette },
  { title: "Exportacao", value: "CSV proposto, ainda sem backend", icon: Download }
];

export function SettingsScreen() {
  const [currency, setCurrency] = useState("BRL");
  const [installTip, setInstallTip] = useState(true);
  const [exportFormat, setExportFormat] = useState("CSV");

  return (
    <main className="mx-auto min-h-svh w-full max-w-[1360px] px-4 pb-[calc(92px+env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] text-[#17211d] sm:px-6 md:pb-8 lg:px-8">
      <Header />
      <section className="rounded-lg border border-[#dde4df] bg-white/82 p-4 shadow-sm sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Preferencias e configuracoes</h2>
          <p className="mt-1 text-sm text-[#66746e]">Mock de preferencias. Nenhuma configuracao e persistida nesta etapa.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <SettingCard icon={ShieldCheck} title="Seguranca" value="Sessao por cookie HttpOnly proposta" />
          <button className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4 text-left" onClick={() => setInstallTip((value) => !value)} type="button"><Smartphone className="text-[#0f6b57]" size={22} /><strong className="mt-4 block">PWA</strong><span className="mt-1 block text-sm leading-5 text-[#66746e]">{installTip ? "Mostrar orientacao de instalacao" : "Ocultar orientacao de instalacao"}</span></button>
          <label className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4"><Palette className="text-[#0f6b57]" size={22} /><strong className="mt-4 block">Moeda</strong><input className="mt-2 min-h-11 w-full rounded-lg border border-[#dde4df] bg-white px-3" value={currency} onChange={(event) => setCurrency(event.target.value.toUpperCase())} /></label>
          <label className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4"><Download className="text-[#0f6b57]" size={22} /><strong className="mt-4 block">Exportacao</strong><select className="mt-2 min-h-11 w-full rounded-lg border border-[#dde4df] bg-white px-3" value={exportFormat} onChange={(event) => setExportFormat(event.target.value)}><option>CSV</option><option>OFX</option><option>PDF</option></select></label>
        </div>
      </section>
      <MobileAppNav active="settings" />
    </main>
  );
}

function SettingCard({ icon: Icon, title, value }: { icon: typeof ShieldCheck; title: string; value: string }) {
  return <article className="rounded-lg border border-[#e7ece8] bg-[#fbfbf8] p-4"><Icon className="text-[#0f6b57]" size={22} /><strong className="mt-4 block">{title}</strong><span className="mt-1 block text-sm leading-5 text-[#66746e]">{value}</span></article>;
}

function Header() {
  return <header className="mb-4 flex min-h-16 items-center justify-between gap-4 md:sticky md:top-0 md:z-20 md:mb-6 md:bg-[#f6f4ef]/80 md:py-3 md:backdrop-blur-xl"><div><p className="mb-1 text-xs font-semibold text-[#66746e]">Hoje, {formatShortDate(baseDate)}</p><h1 className="text-2xl font-semibold md:text-3xl">Ajustes</h1></div><DesktopAppNav active="settings" /><button className="grid size-11 place-items-center rounded-lg border border-[#dde4df] bg-white/80 shadow-sm" type="button" aria-label="Notificacoes"><Bell size={20} /></button></header>;
}
