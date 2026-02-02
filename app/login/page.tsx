"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";

/** Icono Microsoft 365 (cuadros rojo, verde, azul, amarillo) */
function Microsoft365Icon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 21 21"
      className={className}
      aria-hidden
    >
      <rect x="0" y="0" width="10" height="10" fill="#F25022" />
      <rect x="11" y="0" width="10" height="10" fill="#7FBA00" />
      <rect x="0" y="11" width="10" height="10" fill="#00A4EF" />
      <rect x="11" y="11" width="10" height="10" fill="#FFB900" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingOAuth, setLoadingOAuth] = useState(false);

  useEffect(() => {
    const err = searchParams.get("error");
    if (err === "auth_callback_error") {
      setError("No se pudo completar el inicio de sesión con Microsoft 365. Intenta de nuevo o usa correo y contraseña.");
    }
  }, [searchParams]);

  async function handleMicrosoft365() {
    setError(null);
    setLoadingOAuth(true);
    try {
      const supabase = createClient();
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "azure",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: "email openid profile",
        },
      });
      if (oauthError) {
        setError(oauthError.message);
        setLoadingOAuth(false);
        return;
      }
      // La redirección la hace Supabase; si no redirige, mostramos error
      setError("No se pudo iniciar sesión con Microsoft 365. Revisa la configuración en Supabase.");
    } catch {
      setError("Error al conectar con Microsoft 365");
    } finally {
      setLoadingOAuth(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
    } catch {
      setError("Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Móvil: imagen arriba */}
      <div className="relative order-1 h-40 w-full shrink-0 overflow-hidden md:order-none md:hidden">
        <Image
          src="/login-bg.jpg"
          alt="EFC"
          fill
          className="object-cover object-center brightness-[0.88] saturate-[0.85]"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-efc-gray-darker/30" />
      </div>
      {/* Izquierda 70% - Imagen (desktop) - suavizada */}
      <div className="relative order-2 hidden h-screen w-full overflow-hidden md:order-none md:block md:w-[70%]">
        <Image
          src="/login-bg.jpg"
          alt="Fachada EFC Abastecimiento Industrial"
          fill
          className="object-cover object-center brightness-[0.88] saturate-[0.85] contrast-[0.98]"
          priority
          sizes="70vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-efc-gray-darker/25 via-efc-gray-darker/5 to-transparent" />
      </div>

      {/* Derecha 30% - Login */}
      <div className="order-3 relative flex min-h-[calc(100vh-10rem)] w-full flex-col justify-center border-l border-efc-gray-dark/10 bg-gradient-to-b from-[#f5f6f8] to-[#eef0f3] px-6 py-10 md:order-none md:min-h-screen md:py-12 md:shadow-[-8px_0_32px_rgba(0,0,0,0.08)] md:w-[30%] md:min-w-[380px] md:px-12">
        {/* Línea de acento EFC */}
        <div className="absolute left-0 top-0 h-full w-1 bg-efc-lime" />
        {/* Detalle decorativo inferior */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-efc-gray-dark/15 to-transparent" />

        <div className="relative w-full max-w-sm md:mx-0 md:max-w-none md:-mt-8">
          <div className="mb-8 flex justify-center">
            <div className="flex h-40 w-40 items-center justify-center rounded-full border border-efc-gray-dark/15 bg-white/60 p-2 shadow-sm md:h-52 md:w-52 md:p-3">
              <Image
                src="/efc-logo.png"
                alt="EFC Abastecimiento Industrial"
                width={200}
                height={200}
                className="h-full w-full object-contain drop-shadow-sm"
                priority
              />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-efc-gray-darker"
              >
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="h-11 border-efc-gray-dark/25 bg-white/90 shadow-sm transition-colors placeholder:text-efc-gray-dark/50 focus-visible:ring-2 focus-visible:ring-efc-lime focus-visible:ring-offset-0"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-efc-gray-darker"
              >
                Contraseña
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-11 border-efc-gray-dark/25 bg-white/90 pr-11 shadow-sm transition-colors placeholder:text-efc-gray-dark/50 focus-visible:ring-2 focus-visible:ring-efc-lime focus-visible:ring-offset-0"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-efc-gray-dark transition-colors hover:bg-efc-gray-dark/5 hover:text-efc-gray-darker"
                  aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="relative mt-6 mb-5">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-efc-gray-dark/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wide">
                <span className="bg-gradient-to-b from-[#f5f6f8] to-[#eef0f3] px-2 text-efc-gray-dark">
                  O continúa con
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              className="h-11 w-full border-efc-gray-dark/25 bg-white text-efc-gray-darker shadow-sm hover:bg-efc-gray-dark/5"
              onClick={handleMicrosoft365}
              disabled={loadingOAuth}
            >
              {loadingOAuth ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Microsoft365Icon className="mr-2 h-5 w-5 shrink-0" />
              )}
              Continuar con Microsoft 365
            </Button>

            <Button
              type="submit"
              className="mt-5 h-11 w-full bg-efc-lime text-base font-semibold text-efc-gray-darker shadow-sm transition-all hover:bg-efc-lime-dark hover:shadow-md disabled:opacity-70"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
