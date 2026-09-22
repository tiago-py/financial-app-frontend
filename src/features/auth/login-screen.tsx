"use client";

import { Eye, EyeOff, LockKeyhole, WalletCards } from "lucide-react";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { apiRequest, messageFromError } from "@/shared/api/client";

export function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Preencha seu e-mail e sua senha.");
      return;
    }

    setPending(true);
    try {
      await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      router.replace("/");
      router.refresh();
    } catch (requestError) {
      setError(messageFromError(requestError));
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f7f4] text-[#17211d]">
      <div className="mx-auto grid min-h-screen w-full max-w-360 lg:grid-cols-[1fr_520px]">
        {/* Área institucional */}
        <section className="hidden flex-col justify-between bg-[#0f6b57] p-12 text-white lg:flex xl:p-16">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-white/10">
              <WalletCards size={24} aria-hidden="true" />
            </div>

            <div>
              <strong className="block text-lg font-semibold">
                Financial App
              </strong>

              <span className="text-sm text-white/70">
                Controle financeiro pessoal
              </span>
            </div>
          </div>

          <div className="max-w-xl">
            <span className="mb-4 block text-sm font-semibold uppercase tracking-[0.16em] text-white/60">
              Suas finanças em um só lugar
            </span>

            <h1 className="text-4xl font-semibold leading-tight xl:text-5xl">
              Clareza para cuidar melhor do seu dinheiro.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-white/70">
              Acompanhe suas contas, visualize seus saldos e organize sua vida
              financeira de forma simples.
            </p>
          </div>
        </section>

        {/* Login */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
          <div className="w-full max-w-105">
            {/* Logo mobile */}
            <div className="mb-12 flex items-center gap-3 lg:hidden">
              <div className="grid size-11 place-items-center rounded-xl bg-[#0f6b57] text-white">
                <WalletCards size={23} aria-hidden="true" />
              </div>

              <div>
                <strong className="block font-semibold">
                  Financial App
                </strong>

                <span className="text-xs text-[#66746e]">
                  Controle financeiro pessoal
                </span>
              </div>
            </div>

            <div>
              <div className="mb-6 grid size-12 place-items-center rounded-xl bg-[#e7f1ec] text-[#0f6b57]">
                <LockKeyhole size={22} aria-hidden="true" />
              </div>

              <h2 className="text-3xl font-semibold tracking-tight">
                Bem-vindo
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#66746e]">
                Entre para acessar seu painel financeiro.
              </p>
            </div>

            <form className="mt-8 grid gap-5" onSubmit={handleSubmit}>
              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  E-mail
                </span>

                <input
                  className="min-h-12 w-full rounded-lg border border-[#d7dfda] bg-white px-4 text-sm outline-none transition placeholder:text-[#9aa49f] focus:border-[#0f6b57] focus:ring-2 focus:ring-[#0f6b57]/10"
                  type="email"
                  autoComplete="email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-medium">
                  Senha
                </span>

                <div className="flex min-h-12 items-center rounded-lg border border-[#d7dfda] bg-white transition focus-within:border-[#0f6b57] focus-within:ring-2 focus-within:ring-[#0f6b57]/10">
                  <input
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm outline-none placeholder:text-[#9aa49f]"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Digite sua senha"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />

                  <button
                    className="grid size-12 shrink-0 place-items-center text-[#66746e] transition hover:text-[#17211d]"
                    type="button"
                    aria-label={
                      showPassword ? "Ocultar senha" : "Mostrar senha"
                    }
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={19} aria-hidden="true" />
                    ) : (
                      <Eye size={19} aria-hidden="true" />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <div
                  className="rounded-lg border border-[#e8cbc7] bg-[#fff5f3] px-4 py-3 text-sm text-[#a43b32]"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <button
                className="mt-1 min-h-12 rounded-lg bg-[#0f6b57] px-5 text-sm font-semibold text-white transition hover:bg-[#0c5b4a] focus:outline-none focus:ring-2 focus:ring-[#0f6b57] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={pending}
                type="submit"
              >
                {pending ? "Aguarde..." : "Entrar"}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
