"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero, Section } from "@/components/layout/sections";
import { formatCpfInput, normalizeCpf } from "@/lib/application-shared";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/app";

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cpf: normalizeCpf(cpf), password }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao entrar");
      return;
    }

    if (data.mustChangePassword) {
      router.push("/app/alterar-senha");
      router.refresh();
      return;
    }

    router.push(redirect);
    router.refresh();
  }

  return (
    <div className="max-w-md rounded-xl border border-white/10 bg-zinc-900/50 p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="cpf">CPF</Label>
          <Input
            id="cpf"
            inputMode="numeric"
            autoComplete="username"
            value={cpf}
            onChange={(e) => setCpf(formatCpfInput(e.target.value))}
            placeholder="000.000.000-00"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Senha</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Data de nascimento (DD/MM/AAAA)"
            required
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Ainda não é associado?{" "}
        <Link href="/candidatura" className="text-primary hover:underline">
          Iniciar candidatura
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <PageHero eyebrow="Portal" title="Área do Associado" subtitle="Acesse sua conta SOBRAPSI" />
      <Section>
        <Suspense fallback={<p className="text-center text-muted">Carregando...</p>}>
          <LoginForm />
        </Suspense>
      </Section>
    </>
  );
}
