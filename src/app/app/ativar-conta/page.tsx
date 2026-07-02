"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHero, Section } from "@/components/layout/sections";

function ActivateForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Link inválido. Solicite um novo link à SOBRAPSI.");
      return;
    }

    if (password !== confirm) {
      setError("As senhas não coincidem");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/activate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Erro ao ativar conta");
      return;
    }

    router.push("/app");
    router.refresh();
  }

  return (
    <div className="max-w-md rounded-xl border border-white/10 bg-zinc-900/50 p-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nova senha</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirmar senha</Label>
          <Input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
          />
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Ativando..." : "Ativar conta"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Já ativou?{" "}
        <Link href="/app/login" className="text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}

export default function AtivarContaPage() {
  return (
    <>
      <PageHero
        eyebrow="Conta"
        title="Ativar conta"
        subtitle="Crie sua senha para acessar a área do associado SOBRAPSI"
      />
      <Section>
        <Suspense fallback={<p className="text-center text-muted">Carregando...</p>}>
          <ActivateForm />
        </Suspense>
      </Section>
    </>
  );
}
