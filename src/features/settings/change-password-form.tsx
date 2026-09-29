"use client";

import { useRef, useState, type FormEvent } from "react";
import { LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  ApiError,
  apiRequest,
  messageFromError
} from "@/shared/api/client";

export function ChangePasswordForm() {
  const router = useRouter();
  const submitting = useRef(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [pending, setPending] = useState(false);
  const [changed, setChanged] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (submitting.current) return;

    setError("");

    if (newPassword !== confirmation) {
      setError("A confirmação não corresponde à nova senha.");
      return;
    }

    const passwordLength = Array.from(newPassword).length;
    const passwordBytes = new TextEncoder().encode(newPassword).length;

    if (
      !newPassword.trim() ||
      passwordLength < 8 ||
      passwordBytes > 72
    ) {
      setError(
        "Use pelo menos 8 caracteres e no máximo 72 bytes. " +
        "Acentos e emojis ocupam mais de um byte."
      );
      return;
    }

    if (currentPassword === newPassword) {
      setError("A nova senha deve ser diferente da senha atual.");
      return;
    }

    submitting.current = true;
    setPending(true);

    try {
      await apiRequest<void>("/me/password", {
        method: "PATCH",
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmation("");
      setChanged(true);
    } catch (requestError) {
      if (
        requestError instanceof ApiError &&
        requestError.status === 401
      ) {
        router.replace("/login");
        return;
      }

      if (
        requestError instanceof ApiError &&
        requestError.fieldErrors.length > 0
      ) {
        setError(
          requestError.fieldErrors
            .map((field) => field.message)
            .join(". ")
        );
      } else {
        setError(messageFromError(requestError));
      }
    } finally {
      submitting.current = false;
      setPending(false);
    }
  }

  return (
    <section
      aria-labelledby="change-password-title"
      className="mt-5 border-t border-[#dde4df] pt-5"
    >
      <div className="flex items-center gap-2">
        <LockKeyhole
          size={20}
          className="text-[#0f6b57]"
          aria-hidden="true"
        />

        <h3
          id="change-password-title"
          className="text-lg font-semibold"
        >
          Alterar senha
        </h3>
      </div>

      {changed ? (
        <div className="mt-4">
          <p role="status" className="text-sm text-[#0f6b57]">
            Senha alterada com sucesso. Suas sessões foram encerradas.
            Entre novamente com a nova senha.
          </p>

          <a
            href="/login"
            className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-[#0f6b57] px-4 font-semibold text-white"
          >
            Ir para o login
          </a>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-4 grid gap-3"
        >
          <p
            id="password-help"
            className="text-sm text-[#66746e]"
          >
            Use pelo menos 8 caracteres. Após salvar, será necessário
            entrar novamente em todos os dispositivos.
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-[#fff5f3] p-3 text-sm text-[#a43b32]"
            >
              {error}
            </p>
          )}

          <fieldset
            disabled={pending}
            className="grid min-w-0 gap-3 border-0 p-0"
          >
            <PasswordField
              label="Senha atual"
              autoComplete="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
            />

            <PasswordField
              label="Nova senha"
              autoComplete="new-password"
              value={newPassword}
              onChange={setNewPassword}
            />

            <PasswordField
              label="Confirmar nova senha"
              autoComplete="new-password"
              value={confirmation}
              onChange={setConfirmation}
            />

            <button
              type="submit"
              disabled={pending}
              className="min-h-11 rounded-lg bg-[#0f6b57] px-4 font-semibold text-white disabled:opacity-60"
            >
              {pending ? "Alterando senha..." : "Salvar nova senha"}
            </button>
          </fieldset>
        </form>
      )}
    </section>
  );
}

type PasswordFieldProps = {
  label: string;
  autoComplete: "current-password" | "new-password";
  value: string;
  onChange: (value: string) => void;
};

function PasswordField({
  label,
  autoComplete,
  value,
  onChange
}: PasswordFieldProps) {
  return (
    <label className="grid min-w-0 gap-2 text-sm font-medium">
      {label}

      <input
        type="password"
        autoComplete={autoComplete}
        required
        aria-describedby="password-help"
        className="min-h-11 w-full min-w-0 rounded-lg border border-[#dde4df] bg-white px-3"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}